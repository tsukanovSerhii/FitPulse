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

  const percent = restTimer.totalSeconds > 0
    ? Math.max(0, Math.min(100, (restTimer.remainingSeconds / restTimer.totalSeconds) * 100))
    : 0

  return (
    <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md animate-fade-in mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Timer icon + info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center animate-pulse">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Відпочинок між підходами</h4>
              <span className="flex items-center gap-1 text-[11px] text-purple-300">
                <Volume2 className="w-3 h-3" /> Звук увімкнено
              </span>
            </div>
            <p className="text-xs text-purple-200/80">Відновіть дихання перед наступним сетом</p>
          </div>
        </div>

        {/* Countdown display */}
        <div className="flex items-center gap-3">
          <div className="text-3xl font-extrabold font-mono text-purple-300 tracking-wider">
            {formatDuration(restTimer.remainingSeconds)}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(addRestSeconds(30))}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs border-purple-400/40 text-purple-200"
            >
              +30с
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(skipRestTimer())}
              icon={<SkipForward className="w-3.5 h-3.5" />}
              className="text-xs text-slate-300"
            >
              Пропустити
            </Button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-black/40 h-1.5 rounded-full mt-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
