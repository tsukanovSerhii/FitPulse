import { describe, expect, it } from 'vitest'
import reducer, { addSessionExercise, completeSet, finishWorkout, removeSessionExercise, replaceSessionExercise, startWorkout } from './workoutSessionSlice'

const entry = (id: string) => ({ id, exerciseId: `ex-${id}`, sets: 3, reps: 10, restSeconds: 60 })
const set = { reps: 8, weight: 50, completedAt: '' }

describe('free workout session', () => {
  const started = reducer(undefined, startWorkout({ planId: null, dayLabel: 'Вільне тренування', exercises: [], mode: 'free' }))

  it('adds exercises on the fly and focuses the new one', () => {
    let state = reducer(started, addSessionExercise(entry('a')))
    state = reducer(state, addSessionExercise(entry('b')))
    expect(state.mode).toBe('free')
    expect(state.exercises.map((e) => [e.id, e.order])).toEqual([
      ['a', 1],
      ['b', 2],
    ])
    expect(state.currentExerciseIndex).toBe(1)
  })

  it('removes an exercise only while it has no logged sets', () => {
    let state = reducer(started, addSessionExercise(entry('a')))
    state = reducer(state, addSessionExercise(entry('b')))
    state = reducer(state, completeSet({ planExerciseId: 'a', set }))
    expect(reducer(state, removeSessionExercise('a')).exercises).toHaveLength(2)

    state = reducer(state, removeSessionExercise('b'))
    expect(state.exercises.map((e) => e.id)).toEqual(['a'])
    expect(state.currentExerciseIndex).toBe(0)
  })

  it('goes back to plan mode when the workout ends', () => {
    expect(reducer(started, finishWorkout()).mode).toBe('plan')
  })
})

describe('replacing an exercise', () => {
  const plan = reducer(
    undefined,
    startWorkout({ planId: 'p', dayLabel: 'Пн', exercises: [{ ...entry('a'), weight: 80, order: 1 }] }),
  )

  it('swaps the exercise and its weight while the target stays', () => {
    const state = reducer(plan, replaceSessionExercise({ id: 'a', exerciseId: 'ex-smith', weight: 60 }))
    expect(state.exercises[0]).toMatchObject({ id: 'a', exerciseId: 'ex-smith', weight: 60, sets: 3, reps: 10 })
  })

  it('keeps an exercise that already has logged sets', () => {
    const done = reducer(plan, completeSet({ planExerciseId: 'a', set }))
    expect(reducer(done, replaceSessionExercise({ id: 'a', exerciseId: 'ex-smith' })).exercises[0].exerciseId).toBe('ex-a')
  })
})
