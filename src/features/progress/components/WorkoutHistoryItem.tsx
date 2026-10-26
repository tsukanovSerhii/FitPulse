import React, { useState } from 'react'
import { Calendar, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type { WorkoutHistoryLog } from '../model/types'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { formatDate, formatDuration } from '@/utils/formatters'

export interface WorkoutHistoryItemProps {
  log: WorkoutHistoryLog
  onDelete: (id: string) => void
}

export const WorkoutHistoryItem: React.FC<WorkoutHistoryItemProps> = ({
  log,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border-border/80 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-bold text-slate-100">{log.planName}</h4>
            {log.dayLabel && (
              <Badge variant="primary" size="sm">
                {log.dayLabel}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              {formatDate(log.date)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {formatDuration(log.durationSeconds)}
            </span>
          </div>
        </div>

        {/* Right metrics */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <span className="block font-bold text-slate-200">
                {log.totalVolumeKg.toLocaleString()} кг
              </span>
              <span className="text-[10px] text-slate-400">{log.totalSets} підходів</span>
            </div>

            <div className="text-right hidden sm:block">
              <span className="block font-bold text-amber-400">~{log.caloriesBurned}</span>
              <span className="text-[10px] text-slate-400">ккал</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface transition-colors"
              title="Детальніше"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onDelete(log.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Видалити запис"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Accordion content */}
      {isOpen && (
        <div className="mt-4 pt-3 border-t border-border/60 animate-fade-in">
          <h5 className="text-xs font-bold text-slate-300 mb-2">Виконані вправи:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {log.exercises.map((ex, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-surface/50 border border-border/40 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-200 block">{ex.exerciseName}</span>
                  <span className="text-[11px] text-slate-400">
                    {ex.setsCompleted} підходів • {ex.totalReps} повт
                  </span>
                </div>
                {ex.maxWeightKg ? (
                  <span className="text-xs font-bold text-purple-400">
                    макс. {ex.maxWeightKg} кг
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
