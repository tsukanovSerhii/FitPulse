import { useEffect } from 'react'

/**
 * Keeps the screen awake while `active`. Browsers release the lock when the
 * tab is hidden, so it is requested again once the page is visible.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) lock.release()
        else sentinel = lock
      } catch {
        // denied (low battery, browser policy): continue without the lock
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') request()
    }

    request()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      sentinel?.release()
    }
  }, [active])
}
