import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import type { WorkoutHistoryLog } from '../model/types'
import { progressApi, recalculatePersonalRecords } from './progressApi'

const memoryStorage = installMemoryStorage({ signedIn: true })

describe('Personal Records (PR) & History Recalculation Tests', () => {
  beforeEach(() => {
    memoryStorage.clear()
  })

  it('recalculatePersonalRecords extracts max weight and accurate reps at max weight', () => {
    const mockHistory: WorkoutHistoryLog[] = [
      {
        id: 'w-1',
        planName: 'Day 1',
        date: '2026-01-01T10:00:00.000Z',
        durationSeconds: 3000,
        totalSets: 3,
        totalReps: 24,
        totalVolumeKg: 2400,
        caloriesBurned: 300,
        exercises: [
          {
            exerciseId: 'ex-bench-press',
            exerciseName: 'Жим лежачи',
            setsCompleted: 3,
            totalReps: 24,
            maxWeightKg: 100,
            repsAtMaxWeight: 5,
          },
        ],
      },
      {
        id: 'w-2',
        planName: 'Day 2',
        date: '2026-02-01T10:00:00.000Z',
        durationSeconds: 3200,
        totalSets: 3,
        totalReps: 18,
        totalVolumeKg: 2160,
        caloriesBurned: 320,
        exercises: [
          {
            exerciseId: 'ex-bench-press',
            exerciseName: 'Жим лежачи',
            setsCompleted: 3,
            totalReps: 18,
            maxWeightKg: 120,
            repsAtMaxWeight: 3,
          },
        ],
      },
    ]

    const prs = recalculatePersonalRecords(mockHistory)
    expect(prs['ex-bench-press'].maxWeightKg).toBe(120)
    expect(prs['ex-bench-press'].maxReps).toBe(3)
    expect(prs['ex-bench-press'].achievedAt).toBe('2026-02-01T10:00:00.000Z')
  })

  it('Deleting a workout recalculates PRs and removes orphaned records', async () => {
    await progressApi.getProgressData()

    const hugeWorkout: WorkoutHistoryLog = {
      id: 'huge-pr-workout',
      planName: 'Record Day',
      date: '2026-03-30T12:00:00.000Z',
      durationSeconds: 3000,
      totalSets: 1,
      totalReps: 1,
      totalVolumeKg: 200,
      caloriesBurned: 200,
      exercises: [
        {
          exerciseId: 'ex-bench-press',
          exerciseName: 'Жим лежачи',
          setsCompleted: 1,
          totalReps: 1,
          maxWeightKg: 200,
          repsAtMaxWeight: 1,
        },
      ],
    }

    const saveResult = await progressApi.saveWorkoutLog(hugeWorkout)
    expect(saveResult.personalRecords['ex-bench-press'].maxWeightKg).toBe(200)

    const deleteResult = await progressApi.deleteWorkoutLog('huge-pr-workout')

    expect(deleteResult.personalRecords['ex-bench-press']?.maxWeightKg).not.toBe(200)
  })

  it('Clearing all history results in empty history and empty PRs without re-seeding', async () => {
    const { history } = await progressApi.getProgressData()
    for (const item of history) {
      await progressApi.deleteWorkoutLog(item.id)
    }

    const reloaded = await progressApi.getProgressData()
    expect(reloaded.history.length).toBe(0)
    expect(Object.keys(reloaded.personalRecords).length).toBe(0)
  })

  it('a new account starts with an empty journal', async () => {
    memoryStorage.clear()
    const { history, personalRecords } = await progressApi.getProgressData()
    expect(history).toEqual([])
    expect(personalRecords).toEqual({})
  })

  it('demo workouts are removed and records recalculated', async () => {
    memoryStorage.clear()
    const workout = (id: string, weight: number): WorkoutHistoryLog => ({
      id,
      planName: 'Push',
      date: '2026-03-01T10:00:00.000Z',
      durationSeconds: 1800,
      totalSets: 1,
      totalReps: 5,
      totalVolumeKg: weight * 5,
      caloriesBurned: 100,
      exercises: [{ exerciseId: 'ex-bench-press', exerciseName: 'Жим', setsCompleted: 1, totalReps: 5, maxWeightKg: weight, repsAtMaxWeight: 5 }],
    })
    memoryStorage.local.set(memoryStorage.userKey(STORAGE_KEYS.WORKOUT_HISTORY), JSON.stringify([workout('hist-1', 140), workout('mine', 90)]))
    memoryStorage.local.set(memoryStorage.userKey(STORAGE_KEYS.PERSONAL_RECORDS), JSON.stringify({ 'ex-bench-press': { exerciseId: 'ex-bench-press', maxWeightKg: 140 } }))
    const { history, personalRecords } = await progressApi.getProgressData()
    expect(history.map((log) => log.id)).toEqual(['mine'])
    expect(personalRecords['ex-bench-press']!.maxWeightKg).toBe(90)
  })
})
