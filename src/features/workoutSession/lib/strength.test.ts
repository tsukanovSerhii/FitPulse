import { describe, expect, it } from 'vitest'
import type { WorkoutHistoryLog } from '@/features/progress'
import { estimateOneRepMax, lastPerformance, platesPerSide } from './strength'

describe('estimateOneRepMax', () => {
  it('uses the Epley formula rounded to 0.5 kg', () => {
    expect(estimateOneRepMax(100, 5)).toBe(116.5)
    expect(estimateOneRepMax(70, 8)).toBe(88.5)
  })

  it('returns the weight itself for a single rep and nothing without weight', () => {
    expect(estimateOneRepMax(120, 1)).toBe(120)
    expect(estimateOneRepMax(0, 10)).toBeNull()
  })
})

describe('platesPerSide', () => {
  it('splits the load over a 20 kg bar, heaviest plates first', () => {
    expect(platesPerSide(100)).toEqual({ plates: [25, 15], remainder: 0 })
    expect(platesPerSide(72.5)).toEqual({ plates: [25, 1.25], remainder: 0 })
  })

  it('reports what cannot be loaded with standard plates', () => {
    expect(platesPerSide(21)).toEqual({ plates: [], remainder: 1 })
  })

  it('needs no plates for an empty bar or less', () => {
    expect(platesPerSide(20)).toEqual({ plates: [], remainder: 0 })
    expect(platesPerSide(15)).toEqual({ plates: [], remainder: 0 })
  })
})

describe('lastPerformance', () => {
  const log = (date: string, weight?: number): WorkoutHistoryLog => ({
    id: date,
    planName: 'P',
    date,
    durationSeconds: 1,
    totalSets: 1,
    totalReps: 1,
    totalVolumeKg: 1,
    caloriesBurned: 1,
    exercises: [{ exerciseId: 'bench', exerciseName: 'Жим', setsCompleted: 4, totalReps: 32, maxWeightKg: weight, repsAtMaxWeight: 8 }],
  })

  it('takes the most recent session with this exercise', () => {
    expect(lastPerformance([log('2026-10-01', 70), log('2026-10-20', 75)], 'bench')).toEqual({
      date: '2026-10-20',
      weightKg: 75,
      reps: 8,
      sets: 4,
    })
  })

  it('is empty for an exercise never done', () => {
    expect(lastPerformance([log('2026-10-01', 70)], 'squat')).toBeNull()
  })
})
