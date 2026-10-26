import React from 'react'
import { Activity, Flame, Target } from 'lucide-react'
import type { UserProfile } from '../model/types'
import { calculateBMI } from '@/utils/bmi'
import { Card } from '@/components/common/Card'

export interface BMISummaryProps {
  profile: UserProfile
}

export const BMISummary: React.FC<BMISummaryProps> = ({ profile }) => {
  const result = calculateBMI(profile)
  const weightDiff = Number((profile.targetWeightKg - profile.weightKg).toFixed(1))

  return (
    <div className="space-y-4">
      {/* BMI Main Card */}
      <Card className="border-border/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Індекс маси тіла (ІМТ / BMI)</h3>
              <p className="text-xs text-slate-400">Показник відповідності ваги та зросту</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-purple-300 font-mono">
              {result.bmi}
            </span>
            <span className={`block text-xs font-semibold ${result.color}`}>
              {result.category}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-surface/50 p-3 rounded-xl border border-border/50 mb-4">
          {result.description}
        </p>

        {/* Healthy weight range & targets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-slate-400 block mb-1">Здорова вага (діапазон)</span>
            <span className="font-bold text-slate-200">
              {result.healthyWeightMin} - {result.healthyWeightMax} кг
            </span>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              До цільової ваги
            </span>
            <span className="font-bold text-slate-200">
              {weightDiff > 0 ? `+${weightDiff} кг` : weightDiff < 0 ? `${weightDiff} кг` : 'Досягнуто!'}
            </span>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Денна норма калорій
            </span>
            <span className="font-bold text-amber-300 font-mono">
              ~{result.dailyCalorieEstimate} ккал
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
