import type { WorkoutPlan } from '../model/types'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { loadUserData, saveUserData } from '@/shared/storage/userStorage'
import { DEMO_PLANS } from './demo'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const plansApi = {
  async getPlans(): Promise<{ plans: WorkoutPlan[]; activePlanId: string | null }> {
    await delay(100)
    const stored = loadUserData<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, [])
    // New accounts start empty; example programs from earlier versions go unless edited
    const plans = stored.filter((plan) => DEMO_PLANS[plan.id] !== plan.updatedAt)
    if (plans.length !== stored.length) saveUserData(STORAGE_KEYS.WORKOUT_PLANS, plans)

    // Only an explicit choice is stored: a derived default saved here would sync as a newer
    // change and override the plan chosen on another device
    const chosen = loadUserData<string | null>(STORAGE_KEYS.ACTIVE_PLAN_ID, null)
    const activePlanId = chosen && plans.some((p) => p.id === chosen) ? chosen : (plans[0]?.id ?? null)

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
