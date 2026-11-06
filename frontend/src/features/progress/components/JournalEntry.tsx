import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Pencil, Trash2, Trophy } from 'lucide-react'
import { Button } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatMinutes, formatNumber } from '@/shared/lib/formatters'
import type { WorkoutHistoryLog } from '../model/types'

const weekday = new Intl.DateTimeFormat('uk-UA', { weekday: 'short' })

interface JournalEntryProps {
  log: WorkoutHistoryLog
  /** Exercises whose standing record was set in this session */
  records: Set<string>
  highlighted?: boolean
  onDelete: (id: string) => void
  onEdit?: (log: WorkoutHistoryLog) => void
}

export function JournalEntry({ log, records, highlighted = false, onDelete, onEdit }: JournalEntryProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const date = new Date(log.date)

  return (
    <li id={`log-${log.id}`} className={cn('scroll-mt-24 transition-colors duration-700', highlighted && 'bg-accent-soft')}>
      <div className="flex items-center gap-2 px-4 py-3.5 sm:px-5">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left"
        >
          <span className="flex w-10 shrink-0 flex-col items-center leading-none">
            <span className="font-mono text-2xl font-semibold text-fg tabular">{date.getDate()}</span>
            <span className="mt-1 text-[11px] text-fg-subtle">{weekday.format(date)}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate font-semibold text-fg">{log.dayLabel || log.planName}</span>
              {records.size > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-warning">
                  <Trophy className="size-3" aria-hidden="true" />
                  {records.size === 1 ? 'рекорд' : `${records.size} рекорди`}
                </span>
              )}
            </span>
            <span className="block truncate text-xs text-fg-subtle">
              <span className="sm:hidden">{formatNumber(log.totalVolumeKg)} кг · </span>
              {formatMinutes(log.durationSeconds)} · {log.totalSets} підх.
            </span>
          </span>
          <span className="hidden shrink-0 text-right font-mono text-sm text-fg tabular sm:block">{formatNumber(log.totalVolumeKg)} кг</span>
          <ChevronDown className={cn('size-4 shrink-0 text-fg-subtle transition-transform', open && 'rotate-180')} aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div id={panelId} className="animate-fade-in border-t border-line bg-surface-2/40 px-4 py-3 sm:pl-[4.75rem] sm:pr-5">
          {log.planName && log.dayLabel && <p className="mb-2 text-xs text-fg-subtle">{log.planName}</p>}
          {log.exercises.length === 0 ? (
            <p className="text-sm text-fg-subtle">Без деталей по вправах</p>
          ) : (
            <ul className="space-y-2">
              {log.exercises.map((exercise) => (
                <li key={exercise.exerciseId} className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Link to={`/progress/exercise/${exercise.exerciseId}`} className="truncate text-fg underline-offset-2 hover:text-accent hover:underline">
                      {exercise.exerciseName}
                    </Link>
                    {records.has(exercise.exerciseId) && <Trophy className="size-3.5 shrink-0 text-warning" aria-label="рекорд" />}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-fg-muted tabular">
                    {exercise.setsCompleted} × {Math.round(exercise.totalReps / Math.max(exercise.setsCompleted, 1))}
                    {exercise.maxWeightKg ? ` · до ${formatNumber(exercise.maxWeightKg, 1)} кг` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" icon={<Pencil />} onClick={() => onEdit(log)}>
                Редагувати
              </Button>
            )}
            <Button variant="ghost" size="sm" icon={<Trash2 />} onClick={() => onDelete(log.id)} className="text-danger hover:bg-danger-soft hover:text-danger">
              Видалити запис
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}
