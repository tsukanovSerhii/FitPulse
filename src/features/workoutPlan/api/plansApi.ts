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
  // Отримати всі плани тренувань (GET /api/plans)
  async getPlans(): Promise<{ plans: WorkoutPlan[]; activePlanId: string | null }> {
    await delay(100)
    let plans: WorkoutPlan[]

    // Якщо перший запуск застосунку (ключа немає у сховищі) — ініціалізуємо демо-даними
    if (!hasStorageKey(STORAGE_KEYS.WORKOUT_PLANS)) {
      plans = INITIAL_PLANS
      saveToStorage(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_PLANS)
    } else {
      // Якщо ключ існує — повертаємо навіть порожній масив, якщо користувач видалив усі плани
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

  // Створити або оновити план (POST/PUT /api/plans)
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

  // Видалити план (DELETE /api/plans/:id)
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

  // Встановити активний план
  async setActivePlan(planId: string): Promise<string> {
    await delay(100)
    saveToStorage(STORAGE_KEYS.ACTIVE_PLAN_ID, planId)
    return planId
  },
}
