import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { playTimerBeep } from '@/shared/lib/audio'
import { getTimerSettings } from '../lib/timerSettings'
import { clearRestNotification, showRestNotification } from '@/shared/lib/notifications'
import { tickRestTimer, tickWorkoutTimer } from './workoutSessionSlice'

/**
 * Keeps the workout and rest clocks current anywhere in the app, not only on the workout screen.
 * Ticks recompute from the wall clock, and a page that comes back into view catches up at once,
 * so time keeps counting while the phone screen is off.
 */
export function useSessionClock() {
  const dispatch = useAppDispatch()
  const isActive = useAppSelector((state) => state.workoutSession.isActive)
  const endedAt = useAppSelector((state) => state.workoutSession.restTimer.endedAt)
  const signalled = useRef(endedAt)
  const restEndsAt = useAppSelector((state) => (state.workoutSession.restTimer.isRunning ? (state.workoutSession.restTimer.endsAt ?? null) : null))
  const restEnd = useRef(restEndsAt)
  useEffect(() => {
    restEnd.current = restEndsAt
    if (!restEndsAt) clearRestNotification()
  }, [restEndsAt])

  useEffect(() => {
    if (!isActive) return
    const tick = () => {
      dispatch(tickWorkoutTimer())
      dispatch(tickRestTimer())
    }
    tick()
    const id = window.setInterval(tick, 1000)
    // Locking the phone mid-rest leaves "Відпочинок до 14:32" on the lock screen; coming back clears it
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        tick()
        clearRestNotification()
      } else if (restEnd.current && getTimerSettings().restNotifications) {
        showRestNotification(restEnd.current)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isActive, dispatch])

  // A rest that ran out signals once, also when it ended while the screen was off; skipping stays silent
  useEffect(() => {
    if (endedAt && endedAt !== signalled.current) {
      const { sound, vibration } = getTimerSettings()
      if (sound) playTimerBeep()
      if (vibration) navigator.vibrate?.([200, 100, 200])
    }
    signalled.current = endedAt
  }, [endedAt])
}
