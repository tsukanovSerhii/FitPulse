import { STORAGE_KEYS } from '../storage/localStorage'

const memoryStorage = (memory: Map<string, string>) => ({
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => void memory.set(key, String(value)),
  removeItem: (key: string) => void memory.delete(key),
  clear: () => memory.clear(),
  key: () => null,
  get length() {
    return memory.size
  },
})

export const TEST_USER_ID = 'test-user'
const SESSION_KEY = STORAGE_KEYS.SESSION

/**
 * Installs in-memory local and session storage on a fake window for unit tests.
 * With `signedIn`, a test account stays signed in across clear() so per-user data is readable.
 */
export function installMemoryStorage({ signedIn = false } = {}) {
  const local = new Map<string, string>()
  const session = new Map<string, string>()
  globalThis.window = {
    localStorage: memoryStorage(local),
    sessionStorage: memoryStorage(session),
  } as unknown as Window & typeof globalThis
  if (signedIn) local.set(SESSION_KEY, JSON.stringify(TEST_USER_ID))
  return {
    local,
    session,
    clear: () => {
      local.clear()
      session.clear()
      if (signedIn) local.set(SESSION_KEY, JSON.stringify(TEST_USER_ID))
    },
    /** Storage key of per-user data for the test account. */
    userKey: (key: string) => `${key}:${TEST_USER_ID}`,
  }
}
