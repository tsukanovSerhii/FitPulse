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
    <div className="bg-white dark:bg-[#101522] border border-slate-200 dark:border-sky-500/25 rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-xl backdrop-blur-md mb-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Compact label + Sound icon toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Timer className={`w-4 h-4 ${restTimer.isRunning ? 'animate-pulse' : 'text-slate-400'}`} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">Відпочинок</span>

            {!restTimer.isRunning && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 font-bold dark:bg-amber-500/15 px-1.5 py-0.5 rounded border dark:border-amber-500/30">
                Пауза
              </span>
            )}

            {/* Small sound toggle icon button */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-sky-500/15 dark:border-sky-500/30 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/25'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-500 dark:hover:text-slate-300'
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
            className="flex items-center gap-0.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:active:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:border-slate-700/80 text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none"
            title="Зменшити час на 30 секунд (мін. 1 хв)"
          >
            <Minus className="w-3 h-3" />
            <span>30с</span>
          </button>

          {/* Monospace Tabular Countdown */}
          <div className="text-xl sm:text-2xl font-black font-mono text-sky-600 dark:text-sky-400 tracking-wider tabular-nums px-1.5 min-w-[65px] text-center">
            {formatDuration(restTimer.remainingSeconds)}
          </div>

          {/* Plus 30s button */}
          <button
            type="button"
            onClick={() => dispatch(addRestSeconds(30))}
            className="flex items-center gap-0.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:active:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:border-slate-700/80 text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none"
            title="Додати 30 секунд"
          >
            <Plus className="w-3 h-3" />
            <span>30с</span>
          </button>

          {/* Plus 1 min button */}
          <button
            type="button"
            onClick={() => dispatch(addRestSeconds(60))}
            className="flex items-center gap-0.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-sky-50 hover:bg-sky-100 active:bg-sky-50 text-sky-700 hover:text-sky-800 border border-sky-200 dark:bg-sky-600/20 dark:hover:bg-sky-600/30 dark:active:bg-sky-600/20 dark:text-sky-300 dark:hover:text-sky-200 dark:border-sky-500/30 text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none"
            title="Додати 1 хвилину"
          >
            <Plus className="w-3 h-3" />
            <span>1 хв</span>
          </button>

          {/* Play / Pause toggle button */}
          <button
            type="button"
            onClick={() => dispatch(toggleRestTimer())}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              restTimer.isRunning
                ? 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:border-amber-500/30 dark:text-amber-300'
                : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:border-emerald-500/40 dark:text-emerald-300'
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
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/80 transition-all cursor-pointer ml-1"
            title="Пропустити відпочинок"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Пропустити</span>
          </button>
        </div>
      </div>

      {/* Slim Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-950/90 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-200 dark:border-slate-800/60">
        <div
          className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full transition-all duration-1000 ease-linear rounded-full shadow-sm"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
