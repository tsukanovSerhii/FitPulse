// Accounts created before the server existed live in localStorage with a PBKDF2 hash.
// On the first sign-in with the same email they are linked to the server account and removed.
import { hasStorageKey, loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/shared/storage/localStorage'
import { moveUserData } from '@/shared/storage/userStorage'
import type { StoredAccount } from '../model/types'
import { normalizeEmail } from './email'
import { hashPassword } from './password'

const loadAccounts = () => loadFromStorage<StoredAccount[]>(STORAGE_KEYS.ACCOUNTS, [])

export function findLocalAccount(email: string): StoredAccount | undefined {
  const normalized = normalizeEmail(email)
  return loadAccounts().find((account) => account.email === normalized)
}

export async function verifyLocalPassword(account: StoredAccount, password: string): Promise<boolean> {
  return (await hashPassword(password, account.salt)) === account.passwordHash
}

/** Moves the on-device account with this email, its data and photo, to the server account. */
export function adoptLocalAccount(email: string, serverUserId: string): void {
  const account = findLocalAccount(email)
  if (!account) return
  moveUserData(account.id, serverUserId)
  const avatarKey = `${STORAGE_KEYS.AVATAR}:${serverUserId}`
  if (account.avatarUrl && !hasStorageKey(avatarKey)) saveToStorage(avatarKey, account.avatarUrl)
  saveToStorage(
    STORAGE_KEYS.ACCOUNTS,
    loadAccounts().filter((a) => a.id !== account.id),
  )
}
