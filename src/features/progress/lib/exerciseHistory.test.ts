import { describe, expect, it } from 'vitest'
import type { WorkoutHistoryLog } from '../model/types'
import { applyLogEdit } from './editLog'
import { exerciseSessions, exerciseStats } from './exerciseHistory'

const log = (id: string, date: string, exercises: WorkoutHistoryLog['exercises'], totalVolumeKg = 0): WorkoutHistoryLog => ({
  id,
  planName: 'P',
  date,
  durationSeconds: 3000,
  totalSets: 0,
  totalReps: 0,
  totalVolumeKg,
  caloriesBurned: 0,
  exercises,
})
const bench = (maxWeightKg: number, repsAtMaxWeight: number, sets?: { reps: number; weight?: number }[]) => ({
  exerciseId: 'bench',
  exerciseName: 'Жим',
  setsCompleted: sets?.length ?? 3,
  totalReps: sets ? sets.reduce((s, x) => s + x.reps, 0) : 24,
  maxWeightKg,
  repsAtMaxWeight,
  sets,
})

describe('exercise history', () => {
  const history = [log('a', '2026-05-01T10:00:00Z', [bench(70, 8)]), log('b', '2026-10-20T10:00:00Z', [bench(80, 5)]), log('c', '2026-10-25T10:00:00Z', [])]

  it('lists sessions newest first and limits them by period', () => {
    expect(exerciseSessions(history, 'bench').map((s) => s.logId)).toEqual(['b', 'a'])
    expect(exerciseSessions(history, 'bench', { months: 3, now: new Date('2026-11-04') }).map((s) => s.logId)).toEqual(['b'])
  })

  it('finds the best weight and estimated one-rep max', () => {
    const stats = exerciseStats(exerciseSessions(history, 'bench'))
    expect(stats.sessions).toBe(2)
    expect(stats.bestWeight).toMatchObject({ weightKg: 80, reps: 5 })
    expect(stats.bestOneRepMax?.value).toBe(93.5)
  })
})

describe('applyLogEdit', () => {
  it('recomputes totals from edited sets', () => {
    const original = log('a', '2026-11-01', [bench(80, 8, [{ reps: 8, weight: 80 }, { reps: 8, weight: 80 }])], 1280)
    const edited = applyLogEdit(original, {
      ...original,
      exercises: [bench(0, 0, [{ reps: 8, weight: 85 }, { reps: 6, weight: 80 }, { reps: 10, weight: 60 }])],
    })
    expect(edited.exercises[0]).toMatchObject({ setsCompleted: 3, totalReps: 24, maxWeightKg: 85, repsAtMaxWeight: 8 })
    expect(edited.totalSets).toBe(3)
    expect(edited.totalVolumeKg).toBe(8 * 85 + 6 * 80 + 10 * 60)
  })

  it('keeps the untouched part of an older total and drops empty exercises', () => {
    const row = { exerciseId: 'row', exerciseName: 'Тяга', setsCompleted: 3, totalReps: 30, maxWeightKg: 60 }
    const original = log('a', '2026-11-01', [bench(80, 8), row], 5000)
    const edited = applyLogEdit(original, { ...original, exercises: [{ ...bench(80, 8), setsCompleted: 0 }, row] })
    expect(edited.exercises.map((e) => e.exerciseId)).toEqual(['row'])
    expect(edited.totalVolumeKg).toBe(5000 - 80 * 24)
  })
})
