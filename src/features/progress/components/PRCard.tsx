import React from 'react'
import { Trophy, Calendar } from 'lucide-react'
import type { PersonalRecord } from '../model/types'
import { Card } from '@/shared/ui'
import { formatDate } from '@/shared/lib/formatters'

export interface PRCardProps {
  pr: PersonalRecord
}

export const PRCard: React.FC<PRCardProps> = ({ pr }) => {
  return (
    <Card hover className="flex items-center justify-between p-4 sm:p-5">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-lg bg-warning-soft border border-warning/30 text-warning flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-fg">{pr.exerciseName}</h4>
          <span className="text-[11px] text-fg-subtle flex items-center gap-1.5 mt-1">
            <Calendar className="w-3 h-3 text-fg-muted" />
            Встановлено: {formatDate(pr.achievedAt)}
          </span>
        </div>
      </div>

      <div className="text-right">
        <span className="whitespace-nowrap text-2xl font-semibold text-accent font-mono tabular tracking-tight">
          {pr.maxWeightKg} кг
        </span>
        <span className="block text-[11px] text-fg-subtle font-semibold mt-0.5">
          на {pr.maxReps} повт
        </span>
      </div>
    </Card>
  )
}
