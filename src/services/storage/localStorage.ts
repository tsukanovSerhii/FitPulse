/**
 * Безпечна робота з localStorage з fallback значеннями
 */

const STORAGE_KEYS = {
  EXERCISES: 'fitpulse_exercises_v1',
  EXERCISES_FAVORITES: 'fitpulse_favorites_v1',
  WORKOUT_PLANS: 'fitpulse_plans_v1',
  ACTIVE_PLAN_ID: 'fitpulse_active_plan_id_v1',
  WORKOUT_HISTORY: 'fitpulse_history_v1',
  PERSONAL_RECORDS: 'fitpulse_prs_v1',
  USER_PROFILE: 'fitpulse_profile_v1',
  THEME: 'fitpulse_theme_v1',
} as const

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`[Storage] Помилка завантаження ключа "${key}":`, error)
    return defaultValue
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`[Storage] Помилка збереження ключа "${key}":`, error)
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error(`[Storage] Помилка видалення ключа "${key}":`, error)
  }
}

export { STORAGE_KEYS }
