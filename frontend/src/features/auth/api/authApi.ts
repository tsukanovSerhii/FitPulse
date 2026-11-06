import type { AuthResponse, User } from '@fitpulse/contracts'
import { ApiError, apiRequest, NetworkError, setAccessToken, setRefreshHandler } from '@/shared/api/http'
import { loadFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '@/shared/storage/localStorage'
import { loadFromSession, removeFromSession, saveToSession, SESSION_KEYS } from '@/shared/storage/sessionStorage'
import { loadUserData, saveUserData, removeUserData } from '@/shared/storage/userStorage'
import { adoptLocalAccount, findLocalAccount, verifyLocalPassword } from '../lib/localAccounts'
import type { AuthUser, LoginData, RegistrationData } from '../model/types'

/** A failure the sign-in forms show as is. */
export class AuthError extends Error {}

const GENERIC_ERROR = 'Щось пішло не так. Спробуйте ще раз'

export function authErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) return error.message
  if (error instanceof ApiError) {
    if (error.code === 'RATE_LIMITED') return `Забагато спроб. Спробуйте за ${Math.max(1, Math.ceil((error.retryAfter ?? 60) / 60))} хв`
    return error.message
  }
  if (error instanceof AuthError) return error.message
  return GENERIC_ERROR
}

// --- The signed-in user on this device ------------------------------------------------------

function rememberedOnDevice(): boolean {
  return loadFromStorage<string | null>(STORAGE_KEYS.SESSION, null) !== null
}

function forgetUser() {
  removeFromStorage(STORAGE_KEYS.SESSION)
  removeFromStorage(STORAGE_KEYS.AUTH_USER)
  removeFromSession(SESSION_KEYS.AUTH_SESSION)
  removeFromSession(SESSION_KEYS.AUTH_USER_TAB)
}

/** The last known user, so the app opens signed in even without a network. */
function saveUser(user: User, remember: boolean) {
  if (remember) {
    saveToStorage(STORAGE_KEYS.SESSION, user.id)
    saveToStorage(STORAGE_KEYS.AUTH_USER, user)
    removeFromSession(SESSION_KEYS.AUTH_SESSION)
    removeFromSession(SESSION_KEYS.AUTH_USER_TAB)
  } else {
    saveToSession(SESSION_KEYS.AUTH_SESSION, user.id)
    saveToSession(SESSION_KEYS.AUTH_USER_TAB, user)
    removeFromStorage(STORAGE_KEYS.SESSION)
    removeFromStorage(STORAGE_KEYS.AUTH_USER)
  }
}

// The photo is kept per account on this device until there is file storage on the server
const withAvatar = (user: User): AuthUser => {
  const avatarUrl = loadUserData<string | null>(STORAGE_KEYS.AVATAR, null)
  return avatarUrl ? { ...user, avatarUrl } : { ...user }
}

function signedIn({ accessToken, user }: AuthResponse, remember: boolean): AuthUser {
  setAccessToken(accessToken)
  saveUser(user, remember)
  return withAvatar(user)
}

async function refreshSession(): Promise<AuthResponse> {
  try {
    return await apiRequest<AuthResponse>('/api/auth/refresh', { method: 'POST', body: {} })
  } catch (error) {
    // Another tab replaced the refresh cookie a moment ago; the browser now holds the new one
    if (error instanceof ApiError && error.code === 'REFRESH_RETRY') {
      return apiRequest<AuthResponse>('/api/auth/refresh', { method: 'POST', body: {} })
    }
    throw error
  }
}

setRefreshHandler(async () => {
  try {
    signedIn(await refreshSession(), rememberedOnDevice())
    return true
  } catch {
    return false
  }
})

/**
 * The server does not know this email yet, but an account made on this device before the server
 * does and the password matches it: create the server account with the same name and password.
 */
async function signUpLocalAccount(loginError: unknown, { email, password, remember }: LoginData): Promise<AuthResponse> {
  const local = loginError instanceof ApiError && loginError.code === 'INVALID_CREDENTIALS' ? findLocalAccount(email) : undefined
  if (!local || !(await verifyLocalPassword(local, password))) throw loginError
  try {
    return await apiRequest<AuthResponse>('/api/auth/register', { method: 'POST', body: { name: local.name, email, password, remember } })
  } catch (error) {
    // Already registered from another device with another password: the local data waits for that one
    if (error instanceof ApiError && error.code === 'EMAIL_TAKEN') throw loginError
    throw error
  }
}

export const authApi = {
  cachedUser(): AuthUser | null {
    const user =
      loadFromSession<User | null>(SESSION_KEYS.AUTH_USER_TAB, null) ?? (rememberedOnDevice() ? loadFromStorage<User | null>(STORAGE_KEYS.AUTH_USER, null) : null)
    return user ? withAvatar(user) : null
  },

  async register({ name, email, password }: RegistrationData): Promise<AuthUser> {
    const res = await apiRequest<AuthResponse>('/api/auth/register', { method: 'POST', body: { name, email, password, remember: true } })
    adoptLocalAccount(email, res.user.id)
    return signedIn(res, true)
  },

  async login({ email, password, remember }: LoginData): Promise<AuthUser> {
    let res: AuthResponse
    try {
      res = await apiRequest<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password, remember } })
    } catch (error) {
      res = await signUpLocalAccount(error, { email, password, remember })
    }
    adoptLocalAccount(email, res.user.id)
    return signedIn(res, remember)
  },

  /** On start-up: the fresh user, null when signed out, 'offline' when the server is unreachable. */
  async restore(): Promise<AuthUser | null | 'offline'> {
    if (!this.cachedUser()) return null
    const remember = rememberedOnDevice()
    try {
      return signedIn(await refreshSession(), remember)
    } catch (error) {
      if (error instanceof NetworkError) return 'offline'
      if (error instanceof ApiError && error.status === 429) return 'offline'
      setAccessToken(null)
      forgetUser()
      return null
    }
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST', body: {} })
    } catch {
      // Signing out on the device must work offline; the server session expires on its own
    }
    setAccessToken(null)
    forgetUser()
  },

  async updateProfile(changes: { name?: string; email?: string; currentPassword?: string }): Promise<AuthUser> {
    const user = await apiRequest<User>('/api/me', { method: 'PATCH', body: changes, auth: true })
    saveUser(user, rememberedOnDevice())
    return withAvatar(user)
  },

  setAvatar(avatarUrl: string | undefined): void {
    if (avatarUrl) saveUserData(STORAGE_KEYS.AVATAR, avatarUrl)
    else removeUserData(STORAGE_KEYS.AVATAR)
  },

  async forgotPassword(email: string): Promise<void> {
    await apiRequest('/api/auth/password/forgot', { method: 'POST', body: { email } })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiRequest('/api/auth/password/reset', { method: 'POST', body: { token, password } })
  },
}
