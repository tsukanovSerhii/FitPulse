import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { isTimerSoundEnabled, playTimerBeep } from '@/shared/lib/audio'
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

  useEffect(() => {
    if (!isActive) return
    const tick = () => {
      dispatch(tickWorkoutTimer())
      dispatch(tickRestTimer())
    }
    tick()
    const id = window.setInterval(tick, 1000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
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
      if (isTimerSoundEnabled()) playTimerBeep()
      navigator.vibrate?.([200, 100, 200])
    }
    signalled.current = endedAt
  }, [endedAt])
}
