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
    <Card className="p-5 shadow-lg transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left info */}
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">{log.planName}</h4>
            {log.dayLabel && (
              <Badge variant="primary" size="sm">
                {log.dayLabel}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              {formatDate(log.date)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              {formatDuration(log.durationSeconds)}
            </span>
          </div>
        </div>

        {/* Right metrics */}
        <div className="flex items-center gap-4 self-end sm:self-center">
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="block font-black text-slate-900 dark:text-slate-100 text-sm font-mono">
                {log.totalVolumeKg.toLocaleString()} кг
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{log.totalSets} підходів</span>
            </div>

            <div className="text-right hidden sm:block">
              <span className="block font-black text-amber-600 dark:text-amber-400 text-sm font-mono">
                ~{log.caloriesBurned}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">ккал</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-slate-400 dark:hover:text-white dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:border-slate-700/60 transition-colors cursor-pointer"
              title="Детальніше"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onDelete(log.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 transition-colors cursor-pointer"
              title="Видалити запис"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Accordion detail list */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 animate-fade-in">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Виконані вправи:
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {log.exercises.map((ex, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-200 block">{ex.exerciseName}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    {ex.setsCompleted} підходів • {ex.totalReps} повт
                  </span>
                </div>
                {ex.maxWeightKg ? (
                  <span className="text-xs font-black text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 font-mono dark:bg-sky-500/10 px-2.5 py-1 rounded-lg border dark:border-sky-500/20">
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
