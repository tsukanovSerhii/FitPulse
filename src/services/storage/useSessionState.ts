import { useEffect, useState } from 'react'
import { loadFromSession, saveToSession, type SessionKey } from './sessionStorage'

export function useSessionState<T>(key: SessionKey, initial: T) {
  const [value, setValue] = useState<T>(() => loadFromSession(key, initial))

  useEffect(() => {
    saveToSession(key, value)
  }, [key, value])

  return [value, setValue] as const
}
