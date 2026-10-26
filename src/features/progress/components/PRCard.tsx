import React from 'react'
import { Trophy, Calendar } from 'lucide-react'
import type { PersonalRecord } from '../model/types'
import { Card } from '@/components/common/Card'
import { formatDate } from '@/utils/formatters'

export interface PRCardProps {
  pr: PersonalRecord
}

export const PRCard: React.FC<PRCardProps> = ({ pr }) => {
  return (
    <Card hover className="border-slate-800/80 bg-slate-900/80 flex items-center justify-between p-4 sm:p-5 shadow-lg">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">{pr.exerciseName}</h4>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Встановлено: {formatDate(pr.achievedAt)}
          </span>
        </div>
      </div>

      <div className="text-right">
        <span className="text-2xl font-black text-amber-300 font-mono tracking-tight">
          {pr.maxWeightKg} кг
        </span>
        <span className="block text-[11px] text-slate-400 font-semibold mt-0.5">
          на {pr.maxReps} повт
        </span>
      </div>
    </Card>
  )
}
