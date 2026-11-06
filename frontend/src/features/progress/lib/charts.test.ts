import { describe, expect, it } from 'vitest'
import type { WorkoutHistoryLog } from '../model/types'
import { exerciseWeightHistory, trackedExercises, weeklyVolume } from './charts'

const log = (date: string, volume: number, exercises: WorkoutHistoryLog['exercises'] = []): WorkoutHistoryLog => ({
  id: date,
  planName: 'Plan',
  date,
  durationSeconds: 3000,
  totalSets: 10,
  totalReps: 80,
  totalVolumeKg: volume,
  caloriesBurned: 300,
  exercises,
})

const bench = (weight: number, reps = 8) => ({ exerciseId: 'bench', exerciseName: 'Жим', setsCompleted: 3, totalReps: 24, maxWeightKg: weight, repsAtMaxWeight: reps })
const now = new Date(2026, 10, 4, 12) // Wednesday, 4 Nov 2026

describe('weeklyVolume', () => {
  it('buckets logs into Monday-based weeks, oldest first, keeping empty weeks', () => {
    const weeks = weeklyVolume([log('2026-11-02T10:00:00', 5000), log('2026-11-03T10:00:00', 1000), log('2026-10-20T10:00:00', 3000)], 4, now)
    expect(weeks.map((w) => w.volumeKg)).toEqual([0, 3000, 0, 6000])
    expect(weeks[3].workouts).toBe(2)
    expect(weeks[3].weekStart.getDate()).toBe(2)
  })

  it('ignores logs outside the window', () => {
    expect(weeklyVolume([log('2025-01-01T10:00:00', 9000)], 4, now).every((w) => w.volumeKg === 0)).toBe(true)
  })
})

describe('exercise weight history', () => {
  const history = [log('2026-10-28T10:00:00', 0, [bench(80)]), log('2026-10-21T10:00:00', 0, [bench(75, 10)]), log('2026-10-25T10:00:00', 0, [])]

  it('lists weighted exercises by how often they were trained', () => {
    expect(trackedExercises(history)).toEqual([{ id: 'bench', name: 'Жим', sessions: 2 }])
  })

  it('returns the heaviest set per session in date order', () => {
    expect(exerciseWeightHistory(history, 'bench').map((p) => [p.weightKg, p.reps])).toEqual([
      [75, 10],
      [80, 8],
    ])
  })
})
