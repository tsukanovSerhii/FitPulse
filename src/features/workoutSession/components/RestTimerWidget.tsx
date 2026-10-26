import React, { useEffect, useRef } from 'react'
import { Timer, Plus, SkipForward, Volume2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { tickRestTimer, addRestSeconds, skipRestTimer } from '../model/workoutSessionSlice'
import { formatDuration } from '@/utils/formatters'
import { playTimerBeep } from '@/utils/audio'
import { Button } from '@/components/common/Button'

export const RestTimerWidget: React.FC = () => {
  const dispatch = useAppDispatch()
  const restTimer = useAppSelector((state) => state.workoutSession.restTimer)
  const prevRemainingRef = useRef(restTimer.remainingSeconds)

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

  // Play audio sound when timer reaches 0
  useEffect(() => {
    if (prevRemainingRef.current > 0 && restTimer.remainingSeconds === 0 && restTimer.isRunning) {
      playTimerBeep()
    }
    prevRemainingRef.current = restTimer.remainingSeconds
  }, [restTimer.remainingSeconds, restTimer.isRunning])

  if (!restTimer.isRunning && restTimer.remainingSeconds === 0) {
    return null
  }

  const percent =
    restTimer.totalSeconds > 0
      ? Math.max(0, Math.min(100, (restTimer.remainingSeconds / restTimer.totalSeconds) * 100))
      : 0

  return (
    <div className="bg-[#101522] border border-sky-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-xl animate-fade-in mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Timer icon + info */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-md shadow-sky-950/40">
            <Timer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Відпочинок між підходами</h4>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-300 bg-sky-500/15 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                <Volume2 className="w-3 h-3" /> Звуковий сигнал
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Відновіть дихання та пульс перед наступним сетом</p>
          </div>
        </div>

        {/* Countdown display + actions */}
        <div className="flex items-center gap-4">
          <div className="text-3xl sm:text-4xl font-black font-mono text-sky-400 tracking-wider tabular-nums">
            {formatDuration(restTimer.remainingSeconds)}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(addRestSeconds(30))}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs border-sky-500/30 text-sky-200 hover:bg-sky-500/10"
            >
              30с
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(skipRestTimer())}
              icon={<SkipForward className="w-3.5 h-3.5" />}
              className="text-xs text-slate-300 hover:text-white"
            >
              Пропустити
            </Button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-950/90 h-2 rounded-full mt-4 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full transition-all duration-1000 ease-linear rounded-full shadow-md"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
