import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { loadFromSession, removeFromSession, saveToSession, SESSION_KEYS } from '@/services/storage/sessionStorage'

// The return path lives in sessionStorage, so it survives the detour /welcome -> /login -> back.
export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAppSelector((state) => state.auth.user)
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (user) removeFromSession(SESSION_KEYS.RETURN_TO)
    else if (pathname !== '/') saveToSession(SESSION_KEYS.RETURN_TO, pathname + search)
  }, [user, pathname, search])

  if (!user) return <Navigate to="/welcome" replace />
  return children
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const user = useAppSelector((state) => state.auth.user)
  if (user) return <Navigate to={loadFromSession<string>(SESSION_KEYS.RETURN_TO, '/')} replace />
  return children
}
