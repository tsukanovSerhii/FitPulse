import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { installMemoryStorage, TEST_USER_ID } from '@/shared/testing/memoryStorage'
import reducer, { completeSet, startWorkout, tickRestTimer, tickWorkoutTimer } from './workoutSessionSlice'
import type { WorkoutSessionState } from './types'

const memoryStorage = installMemoryStorage({ signedIn: true })

// A page reload builds the slice again from storage: the initial state is read lazily
const reload = () => reducer(undefined, { type: '@@INIT' })
const signInAs = (userId: string) => memoryStorage.local.set(STORAGE_KEYS.SESSION, JSON.stringify(userId))

const exercises = [
  { id: 'a', exerciseId: 'ex-bench-press', sets: 3, reps: 8, restSeconds: 90, order: 1 },
  { id: 'b', exerciseId: 'ex-barbell-row', sets: 3, reps: 10, restSeconds: 60, order: 2 },
]
const set = { reps: 8, weight: 80, completedAt: '2026-11-04T10:00:00.000Z' }

const run = (state: WorkoutSessionState, actions: Parameters<typeof reducer>[1][]) => actions.reduce(reducer, state)

describe('restoring an active workout after a reload', () => {
  let started: WorkoutSessionState

  beforeEach(() => {
    memoryStorage.clear()
    started = reducer(undefined, startWorkout({ planId: 'plan-1', dayLabel: 'Понеділок', exercises }))
  })

  it('keeps logged sets and the current exercise', () => {
    run(started, [completeSet({ planExerciseId: 'a', set, autoStartRest: false }), completeSet({ planExerciseId: 'a', set, autoStartRest: false })])
    const restored = reload()
    expect(restored.isActive).toBe(true)
    expect(restored.planId).toBe('plan-1')
    expect(restored.completedSets.a).toHaveLength(2)
    expect(restored.completedSets.a[1]).toMatchObject({ reps: 8, weight: 80 })
    expect(restored.exercises).toEqual(exercises)
  })

  it('brings back a running rest paused, with the time that was left', () => {
    const resting = run(started, [completeSet({ planExerciseId: 'a', set, restSeconds: 90 }), tickRestTimer(), tickRestTimer()])
    expect(resting.restTimer).toMatchObject({ isRunning: true, remainingSeconds: 88 })

    expect(reload().restTimer).toEqual({ isRunning: false, totalSeconds: 90, remainingSeconds: 88 })
  })

  it('restores the workout time saved at the last 5-second mark', () => {
    run(started, Array.from({ length: 7 }, () => tickWorkoutTimer()))
    expect(reload().elapsedSeconds).toBe(5)
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
