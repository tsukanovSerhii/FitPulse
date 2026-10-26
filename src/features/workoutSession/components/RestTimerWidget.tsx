import React, { useEffect, useRef, useState } from 'react'
import { Timer, Volume2, VolumeX, SkipForward, Plus, Minus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  tickRestTimer,
  addRestSeconds,
  subtractRestSeconds,
  skipRestTimer,
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
      restTimer.isRunning &&
      soundEnabled
    ) {
      playTimerBeep()
    }
    prevRemainingRef.current = restTimer.remainingSeconds
  }, [restTimer.remainingSeconds, restTimer.isRunning, soundEnabled])

  if (!restTimer.isRunning && restTimer.remainingSeconds === 0) {
    return null
  }

  const percent =
    restTimer.totalSeconds > 0
      ? Math.max(0, Math.min(100, (restTimer.remainingSeconds / restTimer.totalSeconds) * 100))
      : 0

  return (
    <div className="bg-[#101522] border border-sky-500/25 rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-xl backdrop-blur-md mb-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Compact label + Sound icon toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            <Timer className="w-4 h-4 animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight">Відпочинок</span>

            {/* Small sound toggle icon button */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-sky-500/15 border-sky-500/30 text-sky-400 hover:bg-sky-500/25'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-500 hover:text-slate-300'
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

        {/* Right: Quick adjustment stepper (-15s / +15s), countdown & skip */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Minus button */}
          <button
            type="button"
            onClick={() => dispatch(subtractRestSeconds(15))}
            className="flex items-center gap-0.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none"
            title="Зменшити час на 15 секунд"
          >
            <Minus className="w-3 h-3" />
            <span>15с</span>
          </button>

          {/* Monospace Tabular Countdown */}
          <div className="text-xl sm:text-2xl font-black font-mono text-sky-400 tracking-wider tabular-nums px-1">
            {formatDuration(restTimer.remainingSeconds)}
          </div>

          {/* Plus button */}
          <button
            type="button"
            onClick={() => dispatch(addRestSeconds(15))}
            className="flex items-center gap-0.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none"
            title="Додати 15 секунд"
          >
            <Plus className="w-3 h-3" />
            <span>15с</span>
          </button>

          {/* Skip button */}
          <button
            type="button"
            onClick={() => dispatch(skipRestTimer())}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer ml-1"
            title="Пропустити відпочинок"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Пропустити</span>
          </button>
        </div>
      </div>

      {/* Slim Progress Bar */}
      <div className="w-full bg-slate-950/90 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-800/60">
        <div
          className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full transition-all duration-1000 ease-linear rounded-full shadow-sm"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
