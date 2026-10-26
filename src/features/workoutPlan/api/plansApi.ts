import type { WorkoutPlan } from '../model/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/services/storage/localStorage'
import { INITIAL_PLANS } from '@/services/mockData/initialPlans'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const plansApi = {
  // Отримати всі плани тренувань (GET /api/plans)
  async getPlans(): Promise<{ plans: WorkoutPlan[]; activePlanId: string | null }> {
    await delay(250)
    let plans = loadFromStorage<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_PLANS)
    if (!plans || plans.length === 0) {
      plans = INITIAL_PLANS
      saveToStorage(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_PLANS)
    }

    let activePlanId = loadFromStorage<string | null>(STORAGE_KEYS.ACTIVE_PLAN_ID, 'plan-ppl-split')
    if (!activePlanId && plans.length > 0) {
      activePlanId = plans[0].id
      saveToStorage(STORAGE_KEYS.ACTIVE_PLAN_ID, activePlanId)
    }

    return { plans, activePlanId }
  },

  // Створити або оновити план (POST/PUT /api/plans)
  async savePlan(plan: WorkoutPlan): Promise<WorkoutPlan> {
    await delay(300)
    const current = loadFromStorage<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_PLANS)
    const index = current.findIndex((p) => p.id === plan.id)
    let updated: WorkoutPlan[]

    if (index >= 0) {
      updated = [...current]
      updated[index] = { ...plan, updatedAt: new Date().toISOString() }
    } else {
      updated = [{ ...plan, updatedAt: new Date().toISOString() }, ...current]
    }

    saveToStorage(STORAGE_KEYS.WORKOUT_PLANS, updated)
    return plan
  },

  // Видалити план (DELETE /api/plans/:id)
  async deletePlan(planId: string): Promise<string> {
    await delay(200)
    const current = loadFromStorage<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_PLANS)
    const updated = current.filter((p) => p.id !== planId)
    saveToStorage(STORAGE_KEYS.WORKOUT_PLANS, updated)

    const activeId = loadFromStorage<string | null>(STORAGE_KEYS.ACTIVE_PLAN_ID, null)
    if (activeId === planId) {
      const newActive = updated.length > 0 ? updated[0].id : null
      saveToStorage(STORAGE_KEYS.ACTIVE_PLAN_ID, newActive)
    }

    return planId
  },

  // Встановити активний план
  async setActivePlan(planId: string): Promise<string> {
    await delay(100)
    saveToStorage(STORAGE_KEYS.ACTIVE_PLAN_ID, planId)
    return planId
  },
}
