import type { WorkoutPlan } from '../model/types'
import {
  hasStorageKey,
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from '@/services/storage/localStorage'
import { INITIAL_PLANS } from '@/services/mockData/initialPlans'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const plansApi = {
  async getPlans(): Promise<{ plans: WorkoutPlan[]; activePlanId: string | null }> {
    await delay(100)
    let plans: WorkoutPlan[]

    // First run: seed demo plans
    if (!hasStorageKey(STORAGE_KEYS.WORKOUT_PLANS)) {
      plans = INITIAL_PLANS
      saveToStorage(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_PLANS)
    } else {
      // Key exists: keep an empty list if the user deleted every plan
      plans = loadFromStorage<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, [])
    }

    let activePlanId: string | null = null
    if (!hasStorageKey(STORAGE_KEYS.ACTIVE_PLAN_ID)) {
      activePlanId = plans.length > 0 ? plans[0].id : null
      saveToStorage(STORAGE_KEYS.ACTIVE_PLAN_ID, activePlanId)
    } else {
      activePlanId = loadFromStorage<string | null>(STORAGE_KEYS.ACTIVE_PLAN_ID, null)
      if (activePlanId && !plans.some((p) => p.id === activePlanId)) {
        activePlanId = plans.length > 0 ? plans[0].id : null
        saveToStorage(STORAGE_KEYS.ACTIVE_PLAN_ID, activePlanId)
      }
    }

    return { plans, activePlanId }
  },

  async savePlan(plan: WorkoutPlan): Promise<WorkoutPlan> {
    await delay(100)
    const current = loadFromStorage<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, [])
    const index = current.findIndex((p) => p.id === plan.id)
    let updated: WorkoutPlan[]

    const cleanPlan: WorkoutPlan = {
      ...JSON.parse(JSON.stringify(plan)),
      updatedAt: new Date().toISOString(),
    }

    if (index >= 0) {
      updated = [...current]
      updated[index] = cleanPlan
    } else {
      updated = [cleanPlan, ...current]
    }

    saveToStorage(STORAGE_KEYS.WORKOUT_PLANS, updated)
    return cleanPlan
  },

  async deletePlan(planId: string): Promise<string> {
    await delay(100)
    const current = loadFromStorage<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, [])
    const updated = current.filter((p) => p.id !== planId)
    saveToStorage(STORAGE_KEYS.WORKOUT_PLANS, updated)

    const activeId = loadFromStorage<string | null>(STORAGE_KEYS.ACTIVE_PLAN_ID, null)
    if (activeId === planId) {
      const newActive = updated.length > 0 ? updated[0].id : null
      saveToStorage(STORAGE_KEYS.ACTIVE_PLAN_ID, newActive)
    }

    return planId
  },

  async setActivePlan(planId: string): Promise<string> {
    await delay(100)
    saveToStorage(STORAGE_KEYS.ACTIVE_PLAN_ID, planId)
    return planId
  },
}
