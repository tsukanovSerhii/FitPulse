import { loadFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '@/shared/storage/localStorage'
import { loadFromSession, removeFromSession, saveToSession, SESSION_KEYS } from '@/shared/storage/sessionStorage'
import { createSalt, hashPassword } from '../lib/password'
import { normalizeEmail } from '../lib/email'
import type { AuthUser, LoginData, RegistrationData, StoredAccount } from '../model/types'

export class AuthError extends Error {}

const loadAccounts = () => loadFromStorage<StoredAccount[]>(STORAGE_KEYS.ACCOUNTS, [])
const saveAccounts = (accounts: StoredAccount[]) => saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts)

function startSession(userId: string, remember: boolean) {
  if (remember) {
    saveToStorage(STORAGE_KEYS.SESSION, userId)
    removeFromSession(SESSION_KEYS.AUTH_SESSION)
  } else {
    saveToSession(SESSION_KEYS.AUTH_SESSION, userId)
    removeFromStorage(STORAGE_KEYS.SESSION)
  }
}

const toUser = ({ passwordHash: _hash, salt: _salt, ...user }: StoredAccount): AuthUser => user

/** Local, storage-backed auth. Swap this module for HTTP calls when a backend exists. */
export const authApi = {
  currentUser(): AuthUser | null {
    const userId =
      loadFromSession<string | null>(SESSION_KEYS.AUTH_SESSION, null) ?? loadFromStorage<string | null>(STORAGE_KEYS.SESSION, null)
    const account = userId ? loadAccounts().find((a) => a.id === userId) : undefined
    return account ? toUser(account) : null
  },

  async register({ name, email, password }: RegistrationData): Promise<AuthUser> {
    const accounts = loadAccounts()
    const normalized = normalizeEmail(email)
    if (accounts.some((a) => a.email === normalized)) {
      throw new AuthError('Акаунт з таким email уже існує')
    }
    const salt = createSalt()
    const account: StoredAccount = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalized,
      plan: 'free',
      createdAt: new Date().toISOString(),
      salt,
      passwordHash: await hashPassword(password, salt),
    }
    saveAccounts([...accounts, account])
    startSession(account.id, true)
    return toUser(account)
  },

  async login({ email, password, remember }: LoginData): Promise<AuthUser> {
    const account = loadAccounts().find((a) => a.email === normalizeEmail(email))
    if (!account || (await hashPassword(password, account.salt)) !== account.passwordHash) {
      throw new AuthError('Невірний email або пароль')
    }
    startSession(account.id, remember)
    return toUser(account)
  },

  logout() {
    removeFromStorage(STORAGE_KEYS.SESSION)
    removeFromSession(SESSION_KEYS.AUTH_SESSION)
  },

  updateUser(id: string, changes: Partial<Pick<AuthUser, 'name' | 'email' | 'avatarUrl'>>): AuthUser {
    const accounts = loadAccounts()
    const index = accounts.findIndex((a) => a.id === id)
    if (index === -1) throw new AuthError('Акаунт не знайдено')
    const updated = { ...accounts[index], ...changes, ...(changes.email && { email: normalizeEmail(changes.email) }) }
    accounts[index] = updated
    saveAccounts(accounts)
    return toUser(updated)
  },
}
