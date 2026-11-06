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

  it('a new account starts with no plans', async () => {
    expect(hasUserData(STORAGE_KEYS.WORKOUT_PLANS)).toBe(false)
    const { plans, activePlanId } = await plansApi.getPlans()
    expect(plans).toEqual([])
    expect(activePlanId).toBeNull()
  })

  it('unchanged demo plans are removed and edited ones kept', async () => {
    const demo = (id: string, updatedAt: string) => ({ id, name: id, createdAt: updatedAt, updatedAt, schedule: {} })
    memoryStorage.local.set(
      memoryStorage.userKey(STORAGE_KEYS.WORKOUT_PLANS),
      JSON.stringify([
        demo('plan-ppl-split', '2026-01-10T10:00:00.000Z'),
        demo('plan-full-body-starter', '2026-03-01T09:00:00.000Z'),
        demo('plan-mine', '2026-04-01T09:00:00.000Z'),
      ]),
    )
    const { plans } = await plansApi.getPlans()
    expect(plans.map((p) => p.id)).toEqual(['plan-full-body-starter', 'plan-mine'])
  })

  it('an active demo plan that was removed is cleared', async () => {
    memoryStorage.local.set(
      memoryStorage.userKey(STORAGE_KEYS.WORKOUT_PLANS),
      JSON.stringify([{ id: 'plan-ppl-split', name: 'PPL', createdAt: '2026-01-10T10:00:00.000Z', updatedAt: '2026-01-10T10:00:00.000Z', schedule: {} }]),
    )
    memoryStorage.local.set(memoryStorage.userKey(STORAGE_KEYS.ACTIVE_PLAN_ID), JSON.stringify('plan-ppl-split'))
    const { plans, activePlanId } = await plansApi.getPlans()
    expect(plans).toEqual([])
    expect(activePlanId).toBeNull()
  })

  it('Saving a plan persists serialized data cleanly', async () => {
    const planToEdit = await plansApi.savePlan({ id: 'plan-mine', name: 'Мій план', createdAt: '2026-05-01T09:00:00.000Z', updatedAt: '2026-05-01T09:00:00.000Z', schedule: {} as never })

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
    await plansApi.savePlan({ id: 'plan-mine', name: 'Мій', createdAt: '2026-05-01T09:00:00.000Z', updatedAt: '2026-05-01T09:00:00.000Z', schedule: {} as never })
    const { plans } = await plansApi.getPlans()
    for (const p of plans) {
      await plansApi.deletePlan(p.id)
    }

    expect(hasUserData(STORAGE_KEYS.WORKOUT_PLANS)).toBe(true)
    const reloaded = await plansApi.getPlans()
    expect(reloaded.plans.length).toBe(0)
  })
})
