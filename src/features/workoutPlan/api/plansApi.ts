import type { WorkoutPlan } from '../model/types'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { hasUserData, loadUserData, saveUserData } from '@/shared/storage/userStorage'
import { INITIAL_PLANS } from './seed'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const plansApi = {
  async getPlans(): Promise<{ plans: WorkoutPlan[]; activePlanId: string | null }> {
    await delay(100)
    let plans: WorkoutPlan[]

    // First run: seed demo plans
    if (!hasUserData(STORAGE_KEYS.WORKOUT_PLANS)) {
      plans = INITIAL_PLANS
      saveUserData(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_PLANS)
    } else {
      // Key exists: keep an empty list if the user deleted every plan
      plans = loadUserData<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, [])
    }

    let activePlanId: string | null = null
    if (!hasUserData(STORAGE_KEYS.ACTIVE_PLAN_ID)) {
      activePlanId = plans.length > 0 ? plans[0].id : null
      saveUserData(STORAGE_KEYS.ACTIVE_PLAN_ID, activePlanId)
    } else {
      activePlanId = loadUserData<string | null>(STORAGE_KEYS.ACTIVE_PLAN_ID, null)
      if (activePlanId && !plans.some((p) => p.id === activePlanId)) {
        activePlanId = plans.length > 0 ? plans[0].id : null
        saveUserData(STORAGE_KEYS.ACTIVE_PLAN_ID, activePlanId)
      }
    }

    return { plans, activePlanId }
  },

  async savePlan(plan: WorkoutPlan): Promise<WorkoutPlan> {
    await delay(100)
    const current = loadUserData<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, [])
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

    saveUserData(STORAGE_KEYS.WORKOUT_PLANS, updated)
    return cleanPlan
  },

  async deletePlan(planId: string): Promise<string> {
    await delay(100)
    const current = loadUserData<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, [])
    const updated = current.filter((p) => p.id !== planId)
    saveUserData(STORAGE_KEYS.WORKOUT_PLANS, updated)

    const activeId = loadUserData<string | null>(STORAGE_KEYS.ACTIVE_PLAN_ID, null)
    if (activeId === planId) {
      const newActive = updated.length > 0 ? updated[0].id : null
      saveUserData(STORAGE_KEYS.ACTIVE_PLAN_ID, newActive)
    }

    return planId
  },

  async setActivePlan(planId: string): Promise<string> {
    await delay(100)
    saveUserData(STORAGE_KEYS.ACTIVE_PLAN_ID, planId)
    return planId
  },
}
