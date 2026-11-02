import React, { useState } from 'react'
import { Calendar, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type { WorkoutHistoryLog } from '../model/types'
import { Card } from '@/components/ui'
import { Badge } from '@/components/ui'
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
    <Card className="p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left info */}
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h4 className="text-base font-bold text-fg">{log.planName}</h4>
            {log.dayLabel && (
              <Badge variant="primary" size="sm">
                {log.dayLabel}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-fg-subtle">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              {formatDate(log.date)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-accent" />
              {formatDuration(log.durationSeconds)}
            </span>
          </div>
        </div>

        {/* Right metrics */}
        <div className="flex items-center gap-4 self-end sm:self-center">
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="block font-black text-fg text-sm font-mono">
                {log.totalVolumeKg.toLocaleString()} кг
              </span>
              <span className="text-[11px] text-fg-subtle">{log.totalSets} підходів</span>
            </div>

            <div className="text-right hidden sm:block">
              <span className="block font-black text-warning text-sm font-mono">
                ~{log.caloriesBurned}
              </span>
              <span className="text-[11px] text-fg-subtle">ккал</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md border border-line bg-surface-2 hover:bg-surface-2 text-fg-subtle hover:text-fg transition-colors cursor-pointer"
              title="Детальніше"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onDelete(log.id)}
              className="p-2 rounded-md text-fg-muted hover:text-danger hover:bg-danger-soft border border-transparent hover:border-danger transition-colors cursor-pointer"
              title="Видалити запис"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Accordion detail list */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-line animate-fade-in">
          <h5 className="text-xs font-bold uppercase tracking-wider text-fg-subtle mb-3">
            Виконані вправи:
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {log.exercises.map((ex, idx) => (
              <div
                key={idx}
                className="p-3 rounded-md bg-surface-2 border border-line flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-fg block">{ex.exerciseName}</span>
                  <span className="text-[11px] text-fg-subtle mt-0.5 block">
                    {ex.setsCompleted} підходів • {ex.totalReps} повт
                  </span>
                </div>
                {ex.maxWeightKg ? (
                  <span className="text-xs font-black text-accent bg-accent-soft border-accent font-mono px-2.5 py-1 rounded-lg border">
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
