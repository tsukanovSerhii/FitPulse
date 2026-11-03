import { hasStorageKey, loadFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from './localStorage'
import { loadFromSession, SESSION_KEYS } from './sessionStorage'

/** Keys whose data belongs to one account. Theme, accounts and sessions stay per device. */
export const USER_KEYS = [
  STORAGE_KEYS.EXERCISES,
  STORAGE_KEYS.EXERCISES_FAVORITES,
  STORAGE_KEYS.MY_EQUIPMENT,
  STORAGE_KEYS.WORKOUT_PLANS,
  STORAGE_KEYS.ACTIVE_PLAN_ID,
  STORAGE_KEYS.WORKOUT_HISTORY,
  STORAGE_KEYS.PERSONAL_RECORDS,
  STORAGE_KEYS.USER_PROFILE,
  STORAGE_KEYS.ACTIVE_SESSION,
] as const

export type UserKey = (typeof USER_KEYS)[number]

const LEGACY_CLAIMED = 'fitpulse_legacy_claimed_v1'

export function currentUserId(): string | null {
  return loadFromSession<string | null>(SESSION_KEYS.AUTH_SESSION, null) ?? loadFromStorage<string | null>(STORAGE_KEYS.SESSION, null)
}

// Data saved before accounts existed is moved, once, to the first account that signs in.
function claimLegacyData(userId: string) {
  if (hasStorageKey(LEGACY_CLAIMED)) return
  for (const key of USER_KEYS) {
    if (hasStorageKey(key) && !hasStorageKey(`${key}:${userId}`)) {
      saveToStorage(`${key}:${userId}`, loadFromStorage(key, null))
    }
    removeFromStorage(key)
  }
  saveToStorage(LEGACY_CLAIMED, true)
}

function scoped(key: UserKey): string | null {
  const userId = currentUserId()
  if (!userId) return null
  claimLegacyData(userId)
  return `${key}:${userId}`
}

export function loadUserData<T>(key: UserKey, fallback: T): T {
  const k = scoped(key)
  return k ? loadFromStorage(k, fallback) : fallback
}

export function saveUserData<T>(key: UserKey, value: T): void {
  const k = scoped(key)
  if (k) saveToStorage(k, value)
}

export function removeUserData(key: UserKey): void {
  const k = scoped(key)
  if (k) removeFromStorage(k)
}

export function hasUserData(key: UserKey): boolean {
  const k = scoped(key)
  return k ? hasStorageKey(k) : false
}

export function clearUserData(): void {
  for (const key of USER_KEYS) removeUserData(key)
}
