import { describe, expect, it } from 'vitest'
import { buildWorkoutLog, formatSessionTitle } from './summary'

const exercise = (id: string, exerciseId: string) => ({ id, exerciseId, sets: 3, reps: 8, restSeconds: 90, order: 1 })
const set = (reps: number, weight?: number) => ({ reps, weight, completedAt: '2026-11-02T10:00:00Z' })

describe('buildWorkoutLog', () => {
  it('sums sets, reps and volume and keeps the heaviest set', () => {
    const log = buildWorkoutLog(
      {
        planId: 'p1',
        dayLabel: 'Понеділок',
        elapsedSeconds: 3000,
        exercises: [exercise('a', 'bench'), exercise('b', 'row')],
        completedSets: { a: [set(8, 60), set(6, 70), set(8, 70)], b: [] },
      },
      (id) => id.toUpperCase(),
      new Date('2026-11-02T11:00:00Z'),
    )

    expect(log.totalSets).toBe(3)
    expect(log.totalReps).toBe(22)
    expect(log.totalVolumeKg).toBe(8 * 60 + 6 * 70 + 8 * 70)
    expect(log.exercises).toEqual([
      {
        exerciseId: 'bench',
        exerciseName: 'BENCH',
        setsCompleted: 3,
        totalReps: 22,
        maxWeightKg: 70,
        repsAtMaxWeight: 8,
        sets: [
          { reps: 8, weight: 60 },
          { reps: 6, weight: 70 },
          { reps: 8, weight: 70 },
        ],
      },
    ])
    expect(log.caloriesBurned).toBe(50 * 7)
  })

  it('handles bodyweight sets without weight', () => {
    const log = buildWorkoutLog(
      { planId: null, dayLabel: null, elapsedSeconds: 10, exercises: [exercise('a', 'pullup')], completedSets: { a: [set(10)] } },
      () => 'Підтягування',
    )
    expect(log.totalVolumeKg).toBe(0)
    expect(log.exercises[0].maxWeightKg).toBeUndefined()
    expect(log.planName).toBe('Індивідуальне тренування')
  })
})

describe('formatSessionTitle', () => {
  it('flattens nested parentheses', () => {
    expect(formatSessionTitle('Понеділок (Push / Pull / Legs (3 дні на тиждень))')).toBe('Понеділок · Push / Pull / Legs')
    expect(formatSessionTitle('Експрес тренування')).toBe('Експрес тренування')
    expect(formatSessionTitle(null)).toBe('Тренування')
  })
})

describe('warm-up and set types', () => {
  it('keeps warm-ups out of the log and marks drop and failure sets', () => {
    const log = buildWorkoutLog(
      {
        planId: null,
        dayLabel: null,
        elapsedSeconds: 600,
        exercises: [exercise('a', 'bench')],
        completedSets: {
          a: [
            { ...set(10, 20), kind: 'warmup' as const },
            { ...set(5, 50), kind: 'warmup' as const },
            { ...set(8, 80), rpe: 8 },
            { ...set(10, 60), kind: 'drop' as const },
          ],
        },
      },
      () => 'Жим',
    )
    expect(log.totalSets).toBe(2)
    expect(log.totalVolumeKg).toBe(8 * 80 + 10 * 60)
    expect(log.exercises[0].sets).toEqual([
      { reps: 8, weight: 80, rpe: 8 },
      { reps: 10, weight: 60, kind: 'drop' },
    ])
  })
})
