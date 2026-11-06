import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { installMemoryStorage, TEST_USER_ID } from '@/shared/testing/memoryStorage'
import reducer, {
  completeSet,
  pauseRestTimer,
  resumeRestTimer,
  skipRestTimer,
  startWorkout,
  tickRestTimer,
  tickWorkoutTimer,
} from './workoutSessionSlice'
import type { WorkoutSessionState } from './types'

const memoryStorage = installMemoryStorage({ signedIn: true })

// A page reload builds the slice again from storage: the initial state is read lazily
const reload = () => reducer(undefined, { type: '@@INIT' })
const signInAs = (userId: string) => memoryStorage.local.set(STORAGE_KEYS.SESSION, JSON.stringify(userId))
// The phone sleeps: no ticks arrive while the clock moves on
const sleep = (seconds: number) => vi.advanceTimersByTime(seconds * 1000)

const exercises = [
  { id: 'a', exerciseId: 'ex-bench-press', sets: 3, reps: 8, restSeconds: 90, order: 1 },
  { id: 'b', exerciseId: 'ex-barbell-row', sets: 3, reps: 10, restSeconds: 60, order: 2 },
]
const set = { reps: 8, weight: 80, completedAt: '2026-11-04T10:00:00.000Z' }

const run = (state: WorkoutSessionState, actions: Parameters<typeof reducer>[1][]) => actions.reduce(reducer, state)

let started: WorkoutSessionState

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-04T10:00:00.000Z'))
  memoryStorage.clear()
  started = reducer(undefined, startWorkout({ planId: 'plan-1', dayLabel: 'Понеділок', exercises }))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('timers while the screen is off', () => {
  it('counts workout time by the clock, not by ticks', () => {
    sleep(95)
    expect(reducer(started, tickWorkoutTimer()).elapsedSeconds).toBe(95)
  })

  it('keeps a rest running and ends it on time', () => {
    const resting = run(started, [completeSet({ planExerciseId: 'a', set, restSeconds: 90 })])
    sleep(60)
    const later = reducer(resting, tickRestTimer())
    expect(later.restTimer).toMatchObject({ isRunning: true, remainingSeconds: 30, totalSeconds: 90 })

    sleep(45)
    const done = reducer(later, tickRestTimer()).restTimer
    expect(done).toMatchObject({ isRunning: false, remainingSeconds: 0, endsAt: null })
    expect(done.endedAt).toBe(Date.parse('2026-11-04T10:01:30.000Z'))
  })

  it('does not count while paused and continues from the same point', () => {
    let state = run(started, [completeSet({ planExerciseId: 'a', set, restSeconds: 90 })])
    sleep(30)
    state = reducer(state, pauseRestTimer())
    sleep(120)
    state = reducer(state, tickRestTimer())
    expect(state.restTimer).toMatchObject({ isRunning: false, remainingSeconds: 60 })

    state = reducer(state, resumeRestTimer())
    sleep(20)
    expect(reducer(state, tickRestTimer()).restTimer).toMatchObject({ isRunning: true, remainingSeconds: 40, totalSeconds: 90 })
  })

  it('stays silent when the rest is skipped', () => {
    const state = run(started, [completeSet({ planExerciseId: 'a', set, restSeconds: 90 }), skipRestTimer()])
    expect(state.restTimer.endedAt).toBeUndefined()
  })
})

describe('restoring an active workout after a reload', () => {
  it('keeps logged sets and the current exercise', () => {
    run(started, [completeSet({ planExerciseId: 'a', set, autoStartRest: false }), completeSet({ planExerciseId: 'a', set, autoStartRest: false })])
    const restored = reload()
    expect(restored.isActive).toBe(true)
    expect(restored.planId).toBe('plan-1')
    expect(restored.completedSets.a).toHaveLength(2)
    expect(restored.completedSets.a[1]).toMatchObject({ reps: 8, weight: 80 })
    expect(restored.exercises).toEqual(exercises)
  })

  it('restores the workout time from the start time', () => {
    sleep(7)
    expect(reload().elapsedSeconds).toBe(7)
  })

  it('brings back a running rest still running, minus the time the app was closed', () => {
    run(started, [completeSet({ planExerciseId: 'a', set, restSeconds: 90 })])
    sleep(25)
    expect(reload().restTimer).toMatchObject({ isRunning: true, remainingSeconds: 65, totalSeconds: 90 })
  })

  it('brings back a rest that ran out while closed as finished', () => {
    run(started, [completeSet({ planExerciseId: 'a', set, restSeconds: 90 })])
    sleep(200)
    expect(reload().restTimer).toMatchObject({ isRunning: false, remainingSeconds: 0 })
  })

  it('keeps a rest from an older saved session paused, since its end time is unknown', () => {
    const resting = run(started, [completeSet({ planExerciseId: 'a', set, restSeconds: 90 })])
    const { endsAt: _drop, ...legacyTimer } = resting.restTimer
    memoryStorage.local.set(memoryStorage.userKey(STORAGE_KEYS.ACTIVE_SESSION), JSON.stringify({ ...resting, restTimer: legacyTimer }))
    expect(reload().restTimer).toMatchObject({ isRunning: false, remainingSeconds: 90 })
  })

  it('keeps each account’s workout separate when users switch', () => {
    run(started, [completeSet({ planExerciseId: 'a', set, autoStartRest: false })])

    signInAs('second-user')
    const other = reload()
    expect(other.isActive).toBe(false)
    expect(other.completedSets).toEqual({})

    signInAs(TEST_USER_ID)
    const back = reload()
    expect(back.isActive).toBe(true)
    expect(back.completedSets.a).toHaveLength(1)
  })
})
