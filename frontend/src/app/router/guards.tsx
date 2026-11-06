import { useEffect, useRef, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { needsOnboarding } from '@/features/profile/model'
import { loadFromSession, removeFromSession, saveToSession, SESSION_KEYS } from '@/shared/storage/sessionStorage'

// The return path lives in sessionStorage, so it survives the detour /welcome -> /login -> back.
export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAppSelector((state) => state.auth.user)
  const { pathname, search } = useLocation()
  // A user who signs out here is not a guest asking for this page, so nothing is remembered
  const wasSignedIn = useRef(false)

  useEffect(() => {
    if (user) wasSignedIn.current = true
    if (user || wasSignedIn.current) removeFromSession(SESSION_KEYS.RETURN_TO)
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

/** Signed-in pages wait for the profile, then send a user who has not answered the questionnaire to it. */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { profile, status } = useAppSelector((state) => state.profile)
  if (status !== 'succeeded') return null
  if (needsOnboarding(profile)) return <Navigate to="/onboarding" replace />
  return children
}
