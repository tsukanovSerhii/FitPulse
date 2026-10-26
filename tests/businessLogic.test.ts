import { describe, it, expect, beforeEach } from 'vitest'

// Mock in-memory localStorage for tests
const memoryStorage = new Map<string, string>()
globalThis.window = {
  localStorage: {
    getItem: (key: string) => (memoryStorage.has(key) ? memoryStorage.get(key)! : null),
    setItem: (key: string, val: string) => memoryStorage.set(key, String(val)),
    removeItem: (key: string) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear(),
    length: 0,
    key: () => null,
  },
} as unknown as Window & typeof globalThis

import { STORAGE_KEYS, hasStorageKey } from '@/services/storage/localStorage'
import { plansApi } from '@/features/workoutPlan/api/plansApi'
import { progressApi, recalculatePersonalRecords } from '@/features/progress/api/progressApi'
import type { WorkoutHistoryLog } from '@/features/progress/model/types'

describe('Workout Plans Persistence & Empty State Tests', () => {
  beforeEach(() => {
    memoryStorage.clear()
  })

  it('First launch initializes default plans', async () => {
    expect(hasStorageKey(STORAGE_KEYS.WORKOUT_PLANS)).toBe(false)
    const { plans, activePlanId } = await plansApi.getPlans()
    expect(plans.length).toBeGreaterThan(0)
    expect(activePlanId).not.toBeNull()
    expect(hasStorageKey(STORAGE_KEYS.WORKOUT_PLANS)).toBe(true)
  })

  it('Saving a plan persists serialized data cleanly', async () => {
    const { plans } = await plansApi.getPlans()
    const planToEdit = plans[0]

    planToEdit.schedule['monday'] = [
      {
        id: 'test-ex-1',
        exerciseId: 'ex-bench-press',
        sets: 4,
        reps: 10,
        weight: 85,
        restSeconds: 90,
      },
    ]

    const saved = await plansApi.savePlan(planToEdit)
    expect(saved.schedule['monday'].length).toBe(1)
    expect(saved.schedule['monday'][0].weight).toBe(85)

    // Verify persisted in storage across reloads
    const reloaded = await plansApi.getPlans()
    const target = reloaded.plans.find((p) => p.id === planToEdit.id)
    expect(target?.schedule['monday'][0].weight).toBe(85)
  })

  it('Deleting all plans persists empty array and DOES NOT re-seed default plans', async () => {
    const { plans } = await plansApi.getPlans()
    for (const p of plans) {
      await plansApi.deletePlan(p.id)
    }

    // Verify storage has empty array key
    expect(hasStorageKey(STORAGE_KEYS.WORKOUT_PLANS)).toBe(true)
    const reloaded = await plansApi.getPlans()
    expect(reloaded.plans.length).toBe(0)
  })
})

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
    // 1. Initial state
    await progressApi.getProgressData()

    // 2. Add workout with a 200kg record
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

    // 3. Delete the 200kg workout
    const deleteResult = await progressApi.deleteWorkoutLog('huge-pr-workout')

    // 4. Assert the 200kg record is gone and recalculated from remaining history
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
})
