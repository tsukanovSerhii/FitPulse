/** Tab-scoped state: survives reloads and in-app navigation, cleared when the tab closes. */
export const SESSION_KEYS = {
  AUTH_SESSION: 'fitpulse_auth_session_tab_v1',
  RETURN_TO: 'fitpulse_return_to_v1',
  REGISTER_DRAFT: 'fitpulse_register_draft_v1',
  EXERCISE_FILTERS: 'fitpulse_exercise_filters_v1',
  EXERCISE_FAVORITES_ONLY: 'fitpulse_exercise_favorites_only_v1',
  PLANS_VIEW: 'fitpulse_plans_view_v1',
} as const

export type SessionKey = (typeof SESSION_KEYS)[keyof typeof SESSION_KEYS]

export function loadFromSession<T>(key: SessionKey, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveToSession<T>(key: SessionKey, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota or private mode: tab state is a convenience, losing it is fine.
  }
}

export function removeFromSession(key: SessionKey): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}
