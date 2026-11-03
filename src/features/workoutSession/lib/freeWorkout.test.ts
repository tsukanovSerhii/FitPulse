import { describe, expect, it } from 'vitest'
import type { Exercise } from '@/features/exercises/model'
import type { WorkoutHistoryLog } from '@/features/progress'
import { freeSessionExercise, pickerResults, planFromSession, recentExerciseIds } from './freeWorkout'

const exercise = (id: string, name: string, primaryMuscle: Exercise['primaryMuscle']) =>
  ({ id, name, primaryMuscle, defaultSets: 3, defaultReps: 10, defaultRestSeconds: 90 }) as Exercise

const catalog = [
  exercise('bench', 'Жим штанги лежачи', 'chest'),
  exercise('squat', 'Присідання зі штангою', 'legs'),
  exercise('thrust', 'Ягідний місток', 'glutes'),
  exercise('curl', 'Підйом штанги на біцепс', 'biceps'),
]

const log = (date: string, items: { exerciseId: string; maxWeightKg?: number; repsAtMaxWeight?: number }[]) =>
  ({ date, exercises: items.map((i) => ({ ...i, exerciseName: '', setsCompleted: 3, totalReps: 30 })) }) as WorkoutHistoryLog

describe('pickerResults', () => {
  it('filters by name and muscle group', () => {
    expect(pickerResults(catalog, 'штанг', 'all').map((e) => e.id)).toEqual(['bench', 'squat', 'curl'])
    expect(pickerResults(catalog, '', 'legs').map((e) => e.id)).toEqual(['squat', 'thrust'])
    expect(pickerResults(catalog, '', 'arms').map((e) => e.id)).toEqual(['curl'])
  })

  it('puts recent exercises first', () => {
    expect(pickerResults(catalog, '', 'all', ['curl', 'squat']).map((e) => e.id)).toEqual(['curl', 'squat', 'bench', 'thrust'])
  })
})

describe('recentExerciseIds', () => {
  it('lists exercises from the newest workouts without repeats', () => {
    const history = [log('2026-11-01', [{ exerciseId: 'bench' }, { exerciseId: 'curl' }]), log('2026-11-02', [{ exerciseId: 'squat' }, { exerciseId: 'bench' }])]
    expect(recentExerciseIds(history)).toEqual(['squat', 'bench', 'curl'])
    expect(recentExerciseIds(history, 2)).toEqual(['squat', 'bench'])
  })
})

describe('freeSessionExercise', () => {
  it('starts from the last performance when there is one', () => {
    const history = [log('2026-11-01', [{ exerciseId: 'bench', maxWeightKg: 80, repsAtMaxWeight: 6 }])]
    expect(freeSessionExercise(catalog[0], history, 1)).toEqual({ id: 'free-bench-1', exerciseId: 'bench', sets: 3, reps: 6, restSeconds: 90, weight: 80 })
    expect(freeSessionExercise(catalog[1], history, 1)).toEqual({ id: 'free-squat-1', exerciseId: 'squat', sets: 3, reps: 10, restSeconds: 90 })
  })
})

describe('planFromSession', () => {
  const now = new Date('2026-11-03T10:00:00.000Z')
  const session = {
    exercises: [
      { id: 'a', exerciseId: 'bench', sets: 3, reps: 10, restSeconds: 120, order: 1 },
      { id: 'b', exerciseId: 'curl', sets: 3, reps: 10, restSeconds: 60, order: 2 },
      { id: 'c', exerciseId: 'squat', sets: 3, reps: 10, restSeconds: 90, order: 3 },
    ],
    completedSets: {
      a: [
        { reps: 8, weight: 70, completedAt: '' },
        { reps: 6, weight: 80, completedAt: '' },
        { reps: 7, weight: 75, completedAt: '' },
      ],
      c: [],
      b: [
        { reps: 12, completedAt: '' },
        { reps: 10, completedAt: '' },
      ],
    },
  }

  it('keeps logged exercises on the chosen day with their heaviest set', () => {
    const plan = planFromSession(session, { name: 'Груди й руки', day: 'tuesday' }, now)
    expect(plan.name).toBe('Груди й руки')
    expect(plan.schedule.monday).toEqual([])
    expect(plan.schedule.tuesday).toEqual([
      { id: `tuesday-1-${now.getTime()}`, exerciseId: 'bench', sets: 3, reps: 6, weight: 80, restSeconds: 120, order: 1 },
      { id: `tuesday-2-${now.getTime()}`, exerciseId: 'curl', sets: 2, reps: 10, restSeconds: 60, order: 2 },
    ])
  })
})
