import React from 'react'
import { Dumbbell, Calendar, Clock, Trophy } from 'lucide-react'
import type { WorkoutHistoryLog, PersonalRecord } from '../model/types'
import { Card } from '@/components/common/Card'
import { formatDuration } from '@/utils/formatters'

export interface StatsGridProps {
  history: WorkoutHistoryLog[]
  personalRecords: Record<string, PersonalRecord>
}

export const StatsGrid: React.FC<StatsGridProps> = ({ history, personalRecords }) => {
  const totalWorkouts = history.length
  const totalSeconds = history.reduce((acc, h) => acc + h.durationSeconds, 0)
  const totalVolumeKg = history.reduce((acc, h) => acc + h.totalVolumeKg, 0)
  const totalCalories = history.reduce((acc, h) => acc + h.caloriesBurned, 0)
  const prCount = Object.keys(personalRecords).length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {/* 1. Workouts */}
      <Card hover className="p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Всього тренувань
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
          {totalWorkouts}
        </div>
        <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-2 block">
          Завершених сесій
        </span>
      </Card>

      {/* 2. Total Volume */}
      <Card hover className="p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Піднята вага
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
          {(totalVolumeKg / 1000).toFixed(1)}{' '}
          <span className="text-lg font-bold text-slate-500 dark:text-slate-400">т</span>
        </div>
        <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold mt-2 block">
          {totalVolumeKg.toLocaleString()} кг сумарно
        </span>
      </Card>

      {/* 3. Time trained */}
      <Card hover className="p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Час у залі
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
          {Math.floor(totalSeconds / 3600)}г {Math.round((totalSeconds % 3600) / 60)}хв
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 block">
          {formatDuration(totalSeconds)}
        </span>
      </Card>

      {/* 4. Personal Records */}
      <Card hover className="p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Рекорди (PR)
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
          {prCount}
        </div>
        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2 block">
          ~{totalCalories.toLocaleString()} спалених ккал
        </span>
      </Card>
    </div>
  )
}
