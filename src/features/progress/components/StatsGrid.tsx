import React from 'react'
import { Dumbbell, Calendar, Clock, Trophy } from 'lucide-react'
import type { WorkoutHistoryLog, PersonalRecord } from '../model/types'
import { Card } from '@/shared/ui'
import { formatDuration } from '@/shared/lib/formatters'

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
      <Card hover className="p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-fg-subtle">
            Всього тренувань
          </span>
          <div className="w-9 h-9 rounded-md bg-accent-soft border border-accent/30 text-accent flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-fg font-mono">
          {totalWorkouts}
        </div>
        <span className="text-xs text-accent font-semibold mt-2 block">
          Завершених сесій
        </span>
      </Card>

      <Card hover className="p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-fg-subtle">
            Піднята вага
          </span>
          <div className="w-9 h-9 rounded-md bg-accent-soft border border-accent/30 text-accent flex items-center justify-center">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-fg font-mono">
          {(totalVolumeKg / 1000).toFixed(1)}{' '}
          <span className="text-lg font-bold text-fg-subtle">т</span>
        </div>
        <span className="text-xs text-accent font-semibold mt-2 block">
          {totalVolumeKg.toLocaleString()} кг сумарно
        </span>
      </Card>

      <Card hover className="p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-fg-subtle">
            Час у залі
          </span>
          <div className="w-9 h-9 rounded-md bg-accent-soft border border-accent/30 text-accent flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-fg font-mono">
          {Math.floor(totalSeconds / 3600)}г {Math.round((totalSeconds % 3600) / 60)}хв
        </div>
        <span className="text-xs text-accent font-semibold mt-2 block">
          {formatDuration(totalSeconds)}
        </span>
      </Card>

      <Card hover className="p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-fg-subtle">
            Рекорди (PR)
          </span>
          <div className="w-9 h-9 rounded-md bg-warning-soft border border-warning/30 text-warning flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-fg font-mono">
          {prCount}
        </div>
        <span className="text-xs text-warning font-semibold mt-2 block">
          ~{totalCalories.toLocaleString()} спалених ккал
        </span>
      </Card>
    </div>
  )
}
