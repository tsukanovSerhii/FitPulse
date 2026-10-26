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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="border-border/80 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Тренувань</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-100">{totalWorkouts}</div>
        <span className="text-[11px] text-purple-400 font-medium mt-1 block">
          Завершених сесій
        </span>
      </Card>

      <Card className="border-border/80 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Піднята вага</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Dumbbell className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-100">
          {(totalVolumeKg / 1000).toFixed(1)} т
        </div>
        <span className="text-[11px] text-indigo-400 font-medium mt-1 block">
          {totalVolumeKg.toLocaleString()} кг сумарно
        </span>
      </Card>

      <Card className="border-border/80 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Час у залі</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-100">
          {Math.round(totalSeconds / 3600)} год {Math.round((totalSeconds % 3600) / 60)} хв
        </div>
        <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
          {formatDuration(totalSeconds)}
        </span>
      </Card>

      <Card className="border-border/80 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Рекорди (PRs)</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-100">{prCount}</div>
        <span className="text-[11px] text-amber-400 font-medium mt-1 block">
          ~{totalCalories.toLocaleString()} спалених ккал
        </span>
      </Card>
    </div>
  )
}
