import { describe, expect, it } from 'vitest'
import type { WorkoutHistoryLog } from '../model/types'
import { percentChange, periodSummary } from './period'

const log = (date: string, volume: number, bench?: number): WorkoutHistoryLog =>
  ({
    id: date,
    date: `${date}T10:00:00`,
    durationSeconds: 3600,
    totalVolumeKg: volume,
    exercises: bench ? [{ exerciseId: 'bench', exerciseName: 'Жим', setsCompleted: 3, totalReps: 24, maxWeightKg: bench }] : [],
  }) as unknown as WorkoutHistoryLog

const now = new Date('2026-11-05T18:00:00') // Thursday

describe('periodSummary', () => {
  const history = [log('2026-10-20', 4000, 75), log('2026-10-27', 5000, 80), log('2026-10-29', 3000), log('2026-11-02', 6000, 85), log('2026-11-04', 2000)]

  it('compares this week with the last one', () => {
    const s = periodSummary(history, 'week', now)
    expect(s.current).toEqual({ workouts: 2, volumeKg: 8000, seconds: 7200 })
    expect(s.previous).toEqual({ workouts: 2, volumeKg: 8000, seconds: 7200 })
    expect(s.records).toBe(1)
    expect(s.topGain).toEqual({ exerciseId: 'bench', name: 'Жим', fromKg: 80, toKg: 85 })
  })

  it('compares this month with the last one', () => {
    const s = periodSummary(history, 'month', now)
    expect(s.current.workouts).toBe(2)
    expect(s.previous.workouts).toBe(3)
  })

  it('reports change in percent', () => {
    expect(percentChange(120, 100)).toBe(20)
    expect(percentChange(5, 0)).toBeNull()
  })
})
