import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { hasUserData } from '@/shared/storage/userStorage'
import { plansApi } from './plansApi'

const memoryStorage = installMemoryStorage({ signedIn: true })

describe('Workout Plans Persistence & Empty State Tests', () => {
  beforeEach(() => {
    memoryStorage.clear()
  })

  it('First launch initializes default plans', async () => {
    expect(hasUserData(STORAGE_KEYS.WORKOUT_PLANS)).toBe(false)
    const { plans, activePlanId } = await plansApi.getPlans()
    expect(plans.length).toBeGreaterThan(0)
    expect(activePlanId).not.toBeNull()
    expect(hasUserData(STORAGE_KEYS.WORKOUT_PLANS)).toBe(true)
  })

  it('Saving a plan persists serialized data cleanly', async () => {
    const { plans } = await plansApi.getPlans()
    const planToEdit = plans[0]

    planToEdit.schedule['monday'] = [
      {
        id: 'test-ex-1',
        exerciseId: 'ex-bench-press',
        order: 1,
        sets: 4,
        reps: 10,
        weight: 85,
        restSeconds: 90,
      },
    ]

    const saved = await plansApi.savePlan(planToEdit)
    expect(saved.schedule['monday'].length).toBe(1)
    expect(saved.schedule['monday'][0].weight).toBe(85)

    const reloaded = await plansApi.getPlans()
    const target = reloaded.plans.find((p) => p.id === planToEdit.id)
    expect(target?.schedule['monday'][0].weight).toBe(85)
  })

  it('Deleting all plans persists empty array and DOES NOT re-seed default plans', async () => {
    const { plans } = await plansApi.getPlans()
    for (const p of plans) {
      await plansApi.deletePlan(p.id)
    }

    expect(hasUserData(STORAGE_KEYS.WORKOUT_PLANS)).toBe(true)
    const reloaded = await plansApi.getPlans()
    expect(reloaded.plans.length).toBe(0)
  })
})
