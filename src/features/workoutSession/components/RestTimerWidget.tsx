import React, { useEffect, useRef, useState } from 'react'
import { Timer, Volume2, VolumeX, SkipForward, Plus, Minus, Play, Pause } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  tickRestTimer,
  addRestSeconds,
  subtractRestSeconds,
  skipRestTimer,
  toggleRestTimer,
} from '../model/workoutSessionSlice'
import { formatDuration } from '@/utils/formatters'
import { playTimerBeep } from '@/utils/audio'

export const RestTimerWidget: React.FC = () => {
  const dispatch = useAppDispatch()
  const restTimer = useAppSelector((state) => state.workoutSession.restTimer)
  const prevRemainingRef = useRef(restTimer.remainingSeconds)

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fitpulse_sound_enabled') !== 'false'
    } catch {
      return true
    }
  })

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev
      try {
        localStorage.setItem('fitpulse_sound_enabled', String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  useEffect(() => {
    let interval: number | null = null

    if (restTimer.isRunning && restTimer.remainingSeconds > 0) {
      interval = window.setInterval(() => {
        dispatch(tickRestTimer())
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [restTimer.isRunning, restTimer.remainingSeconds, dispatch])

  // Play audio sound only when timer reaches 0 and sound is enabled
  useEffect(() => {
    if (
      prevRemainingRef.current > 0 &&
      restTimer.remainingSeconds === 0 &&
      soundEnabled
    ) {
      playTimerBeep()
    }
    prevRemainingRef.current = restTimer.remainingSeconds
  }, [restTimer.remainingSeconds, soundEnabled])

  if (!restTimer.isRunning && restTimer.remainingSeconds === 0) {
    return null
  }

  const percent =
    restTimer.totalSeconds > 0
      ? Math.max(0, Math.min(100, (restTimer.remainingSeconds / restTimer.totalSeconds) * 100))
      : 0

  return (
    <div className="bg-surface border border-line rounded-lg px-4 py-3 sm:px-5 sm:py-3.5 mb-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Compact label + Sound icon toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-md bg-accent-soft border border-accent/30 text-accent flex items-center justify-center shrink-0">
            <Timer className={`w-4 h-4 ${restTimer.isRunning ? 'animate-pulse' : 'text-fg-muted'}`} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-fg tracking-tight">Відпочинок</span>

            {!restTimer.isRunning && (
              <span className="text-[10px] text-warning bg-warning-soft border-warning font-bold px-1.5 py-0.5 rounded border">
                Пауза
              </span>
            )}

            {/* Small sound toggle icon button */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-accent-soft border-accent text-accent hover:bg-accent-soft'
                  : 'bg-surface-2 border-line text-fg-subtle hover:text-fg-muted'
              }`}
              title={soundEnabled ? 'Звук увімкнено (натисніть, щоб вимкнути)' : 'Звук вимкнено (натисніть, щоб увімкнути)'}
              aria-label="Звуковий сигнал"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Right: Quick adjustment stepper (-30s, countdown, +30s, +1хв), Play/Pause & skip */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Minus button */}
          <button
            type="button"
            onClick={() => dispatch(subtractRestSeconds(30))}
            className="flex items-center gap-0.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md bg-surface-2 hover:bg-surface-2 text-fg-muted hover:text-fg border border-line text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none"
            title="Зменшити час на 30 секунд (мін. 1 хв)"
          >
            <Minus className="w-3 h-3" />
            <span>30с</span>
          </button>

          {/* Monospace Tabular Countdown */}
          <div className="text-xl sm:text-2xl font-black font-mono text-accent tracking-wider tabular-nums px-1.5 min-w-[65px] text-center">
            {formatDuration(restTimer.remainingSeconds)}
          </div>

          {/* Plus 30s button */}
          <button
            type="button"
            onClick={() => dispatch(addRestSeconds(30))}
            className="flex items-center gap-0.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md bg-surface-2 hover:bg-surface-2 text-fg-muted hover:text-fg border border-line text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none"
            title="Додати 30 секунд"
          >
            <Plus className="w-3 h-3" />
            <span>30с</span>
          </button>

          {/* Plus 1 min button */}
          <button
            type="button"
            onClick={() => dispatch(addRestSeconds(60))}
            className="flex items-center gap-0.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-md bg-accent-soft hover:bg-accent-soft active:bg-accent-soft text-accent hover:text-accent border border-accent text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none"
            title="Додати 1 хвилину"
          >
            <Plus className="w-3 h-3" />
            <span>1 хв</span>
          </button>

          {/* Play / Pause toggle button */}
          <button
            type="button"
            onClick={() => dispatch(toggleRestTimer())}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              restTimer.isRunning
                ? 'bg-warning-soft hover:bg-warning-soft border border-warning text-warning'
                : 'bg-accent-soft hover:bg-accent-soft border border-accent text-accent'
            }`}
            title={restTimer.isRunning ? 'Поставити на паузу' : 'Запустити відлік таймера'}
          >
            {restTimer.isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Пауза</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Старт</span>
              </>
            )}
          </button>

          {/* Skip button */}
          <button
            type="button"
            onClick={() => dispatch(skipRestTimer())}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-fg-subtle hover:text-fg hover:bg-surface-2 transition-all cursor-pointer ml-1"
            title="Пропустити відпочинок"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Пропустити</span>
          </button>
        </div>
      </div>

      {/* Slim Progress Bar */}
      <div className="w-full bg-surface-2 h-1.5 rounded-full mt-2.5 overflow-hidden border border-line/60">
        <div
          className="bg-gradient-to-r from-accent to-accent h-full transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
