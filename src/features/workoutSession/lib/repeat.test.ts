import { describe, expect, it } from 'vitest'
import type { WorkoutHistoryLog } from '@/features/progress'
import { exercisesFromLog, latestRepeatable } from './repeat'

const log = (id: string, date: string, exercises: WorkoutHistoryLog['exercises']) => ({ id, date, planName: 'P', exercises }) as unknown as WorkoutHistoryLog

describe('repeating a workout', () => {
  it('keeps the sets, reps and weight of the heaviest set', () => {
    const done = log('a', '2026-11-01', [
      { exerciseId: 'ex-bench-press', exerciseName: 'Жим', setsCompleted: 3, totalReps: 22, maxWeightKg: 80, repsAtMaxWeight: 6, sets: [{ reps: 8, weight: 75 }, { reps: 6, weight: 80 }, { reps: 8, weight: 75 }] },
      { exerciseId: 'ex-pull-ups', exerciseName: 'Підтягування', setsCompleted: 4, totalReps: 30 },
    ])
    expect(exercisesFromLog(done, [{ id: 'ex-bench-press', defaultRestSeconds: 120 }], 1)).toEqual([
      { id: 'repeat-1-1', exerciseId: 'ex-bench-press', sets: 3, reps: 6, weight: 80, restSeconds: 120, order: 1 },
      { id: 'repeat-2-1', exerciseId: 'ex-pull-ups', sets: 4, reps: 8, restSeconds: 90, order: 2 },
    ])
  })

  it('picks the newest workout that has exercises', () => {
    const history = [log('old', '2026-10-01', [{ exerciseId: 'x', exerciseName: 'X', setsCompleted: 1, totalReps: 5 }]), log('empty', '2026-11-02', [])]
    expect(latestRepeatable(history)?.id).toBe('old')
  })
})
