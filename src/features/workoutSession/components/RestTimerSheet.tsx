import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { Button, IconButton, ProgressRing } from '@/shared/ui'
import { playTimerBeep } from '@/shared/lib/audio'
import { formatDuration } from '@/shared/lib/formatters'
import {
  addRestSeconds,
  skipRestTimer,
  subtractRestSeconds,
  tickRestTimer,
  toggleRestTimer,
} from '../model/workoutSessionSlice'

const SOUND_KEY = 'fitpulse_sound_enabled'

function useSoundPreference() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== 'false'
    } catch {
      return true
    }
  })
  const toggle = () =>
    setEnabled((prev) => {
      try {
        localStorage.setItem(SOUND_KEY, String(!prev))
      } catch {
        // without storage the preference lasts until reload
      }
      return !prev
    })
  return [enabled, toggle] as const
}

export function RestTimerSheet({ nextHint }: { nextHint?: string }) {
  const dispatch = useAppDispatch()
  const timer = useAppSelector((state) => state.workoutSession.restTimer)
  const [soundEnabled, toggleSound] = useSoundPreference()
  const prevRemaining = useRef(timer.remainingSeconds)

  useEffect(() => {
    if (!timer.isRunning || timer.remainingSeconds <= 0) return
    const id = window.setInterval(() => dispatch(tickRestTimer()), 1000)
    return () => clearInterval(id)
  }, [timer.isRunning, timer.remainingSeconds, dispatch])

  useEffect(() => {
    if (prevRemaining.current > 0 && timer.remainingSeconds === 0) {
      if (soundEnabled) playTimerBeep()
      navigator.vibrate?.([200, 100, 200])
    }
    prevRemaining.current = timer.remainingSeconds
  }, [timer.remainingSeconds, soundEnabled])

  if (timer.remainingSeconds <= 0) return null

  const percent = timer.totalSeconds > 0 ? (timer.remainingSeconds / timer.totalSeconds) * 100 : 0

  return (
    <section
      aria-label="Відпочинок"
      className="fixed inset-x-0 bottom-0 z-[60] animate-rise rounded-t-lg border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-pop"
    >
      <div className="mx-auto max-w-lg space-y-5 px-5 pb-5 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Відпочинок</span>
          <IconButton
            size="sm"
            label={soundEnabled ? 'Вимкнути звук' : 'Увімкнути звук'}
            icon={soundEnabled ? <Volume2 /> : <VolumeX />}
            onClick={toggleSound}
          />
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => dispatch(subtractRestSeconds(15))}
            className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-surface-2 font-mono text-sm font-semibold text-fg active:bg-line-strong"
            aria-label="Мінус 15 секунд"
          >
            −15
          </button>
          <ProgressRing value={percent} label="Залишок відпочинку" size={150} stroke={5}>
            <span className="font-mono text-4xl font-semibold text-fg tabular" aria-live="off">
              {formatDuration(timer.remainingSeconds)}
            </span>
            <button
              type="button"
              onClick={() => dispatch(toggleRestTimer())}
              aria-label={timer.isRunning ? 'Пауза' : 'Продовжити'}
              className="mt-1 flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-muted hover:text-fg"
            >
              {timer.isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
          </ProgressRing>
          <button
            type="button"
            onClick={() => dispatch(addRestSeconds(15))}
            className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-surface-2 font-mono text-sm font-semibold text-fg active:bg-line-strong"
            aria-label="Плюс 15 секунд"
          >
            +15
          </button>
        </div>

        {nextHint && <p className="text-center text-sm text-fg-muted">Далі: {nextHint}</p>}

        <Button variant="secondary" size="lg" className="w-full" onClick={() => dispatch(skipRestTimer())}>
          Пропустити
        </Button>
      </div>
    </section>
  )
}
