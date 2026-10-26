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
      <Card className="border-slate-800/80 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Індекс маси тіла (ІМТ / BMI)</h3>
              <p className="text-xs text-slate-400">Показник відповідності маси тіла та зросту</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-3xl sm:text-4xl font-black text-purple-300 font-mono tracking-tight">
              {result.bmi}
            </span>
            <span className={`block text-xs font-bold ${result.color} mt-0.5`}>
              {result.category}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800 mb-5">
          {result.description}
        </p>

        {/* Healthy weight range & targets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block mb-1">Здорова вага (діапазон)</span>
            <span className="text-base font-black text-white font-mono">
              {result.healthyWeightMin} - {result.healthyWeightMax} кг
            </span>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              До цільової ваги
            </span>
            <span className="text-base font-black text-indigo-300 font-mono">
              {weightDiff > 0 ? `+${weightDiff} кг` : weightDiff < 0 ? `${weightDiff} кг` : 'Досягнуто!'}
            </span>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Денна норма калорій
            </span>
            <span className="text-base font-black text-amber-300 font-mono">
              ~{result.dailyCalorieEstimate} ккал
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
