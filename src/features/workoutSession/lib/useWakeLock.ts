import { useEffect } from 'react'

/**
 * Не дає екрану згаснути, доки `active`. Браузер знімає блокування,
 * коли вкладка ховається, тому повторно запитуємо його при поверненні.
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
        // відмова (низький заряд, політика браузера) — працюємо без блокування
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
