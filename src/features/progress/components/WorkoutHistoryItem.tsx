import { useId, useState } from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'
import { IconButton } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatMinutes, formatNumber } from '@/shared/lib/formatters'
import type { WorkoutHistoryLog } from '../model/types'

interface WorkoutHistoryItemProps {
  log: WorkoutHistoryLog
  onDelete: (id: string) => void
}

export function WorkoutHistoryItem({ log, onDelete }: WorkoutHistoryItemProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <li>
      <div className="flex items-center gap-2 px-4 py-3.5 sm:px-5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-fg">{log.dayLabel || log.planName}</span>
            <span className="text-xs text-fg-subtle">
              {formatDate(log.date)} · {formatMinutes(log.durationSeconds)}
            </span>
          </span>
          <span className="shrink-0 text-right font-mono text-sm tabular">
            <span className="block text-fg">{formatNumber(log.totalVolumeKg)} кг</span>
            <span className="text-xs text-fg-subtle">{log.totalSets} підх.</span>
          </span>
          <ChevronDown className={cn('size-4 shrink-0 text-fg-subtle transition-transform', open && 'rotate-180')} aria-hidden="true" />
        </button>
        <IconButton size="sm" label="Видалити запис" icon={<Trash2 />} onClick={() => onDelete(log.id)} className="hover:text-danger" />
      </div>

      {open && (
        <ul id={panelId} className="animate-fade-in space-y-1.5 border-t border-line bg-surface-2/40 px-4 py-3 sm:px-5">
          {log.exercises.length === 0 && <li className="text-sm text-fg-subtle">Без деталей по вправах</li>}
          {log.exercises.map((exercise) => (
            <li key={exercise.exerciseId} className="flex items-baseline justify-between gap-4 text-sm">
              <span className="min-w-0 truncate text-fg">{exercise.exerciseName}</span>
              <span className="shrink-0 font-mono text-xs text-fg-muted tabular">
                {exercise.setsCompleted} × {Math.round(exercise.totalReps / Math.max(exercise.setsCompleted, 1))}
                {exercise.maxWeightKg ? ` · до ${formatNumber(exercise.maxWeightKg, 1)} кг` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
