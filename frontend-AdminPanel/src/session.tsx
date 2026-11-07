import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AdminClient, AdminUser } from './api/client.ts'

export const SessionContext = createContext<{ client: AdminClient; user: AdminUser } | null>(null)

export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession outside SessionContext')
  return session
}

/** Loads one API resource; `reload` fetches it again after a change. */
export function useApi<T>(path: string | null) {
  const { client } = useSession()
  const [state, setState] = useState<{ path: string | null; data: T | null; error: string | null }>({ path: null, data: null, error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!path) return
    let active = true
    client.request<T>(path).then(
      (data) => active && setState({ path, data, error: null }),
      (err: unknown) => active && setState({ path, data: null, error: err instanceof Error ? err.message : 'Щось пішло не так' }),
    )
    return () => {
      active = false
    }
  }, [client, path, version])

  const current = state.path === path
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    reload: useCallback(() => setVersion((v) => v + 1), []),
    setData: useCallback((data: T) => setState((s) => ({ ...s, data })), []),
  }
}
