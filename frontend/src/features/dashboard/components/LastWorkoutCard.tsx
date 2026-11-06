import { Link } from 'react-router-dom'
import { ArrowRight, Clock, RotateCcw } from 'lucide-react'
import type { WorkoutHistoryLog } from '@/features/progress'
import { formatDate, formatDuration, formatNumber, pluralWord } from '@/shared/lib/formatters'
import { Button, Section } from '@/shared/ui'

export function LastWorkoutCard({ log, onRepeat }: { log: WorkoutHistoryLog; onRepeat?: () => void }) {
  const metrics = [
    { value: formatNumber(log.totalVolumeKg), unit: 'кг' },
    { value: log.totalSets, unit: 'підх.' },
    { value: log.exercises.length, unit: pluralWord(log.exercises.length, ['вправа', 'вправи', 'вправ']) },
  ]

  return (
    <Section
      title="Останнє тренування"
      aside={
        <Link to="/progress/journal" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover">
          Журнал <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      <Link to="/progress/journal" className="block rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-fg">{log.dayLabel || log.planName}</p>
            <p className="mt-1 text-xs text-fg-subtle">{formatDate(log.date)}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-fg-muted tabular">
            <Clock className="size-3.5" aria-hidden="true" />
            {formatDuration(log.durationSeconds)}
          </span>
        </div>
        <div className="mt-4 flex gap-6 font-mono text-sm tabular">
          {metrics.map((m) => (
            <span key={m.unit}>
              <span className="text-fg">{m.value}</span> <span className="text-fg-subtle">{m.unit}</span>
            </span>
          ))}
        </div>
      </Link>
      {onRepeat && log.exercises.length > 0 && (
        <Button variant="outline" className="mt-3 w-full" icon={<RotateCcw />} onClick={onRepeat}>
          Повторити це тренування
        </Button>
      )}
    </Section>
  )
}
