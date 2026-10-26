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
    <Card className="border-border/80 flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-100">{pr.exerciseName}</h4>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3 text-purple-400" />
            Встановлено: {formatDate(pr.achievedAt)}
          </span>
        </div>
      </div>

      <div className="text-right">
        <span className="text-xl font-black text-amber-300 font-mono">
          {pr.maxWeightKg} кг
        </span>
        <span className="block text-[10px] text-slate-400 font-medium">
          на {pr.maxReps} повт
        </span>
      </div>
    </Card>
  )
}
