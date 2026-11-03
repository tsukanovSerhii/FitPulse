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

/** Installs in-memory local and session storage on a fake window for unit tests. */
export function installMemoryStorage() {
  const local = new Map<string, string>()
  const session = new Map<string, string>()
  globalThis.window = {
    localStorage: memoryStorage(local),
    sessionStorage: memoryStorage(session),
  } as unknown as Window & typeof globalThis
  return {
    local,
    session,
    clear: () => {
      local.clear()
      session.clear()
    },
  }
}
