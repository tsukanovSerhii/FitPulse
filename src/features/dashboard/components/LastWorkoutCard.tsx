import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import type { WorkoutHistoryLog } from '@/features/progress/model/types'
import { formatDate, formatDuration, formatNumber } from '@/utils/formatters'
import { DashboardSection } from './DashboardSection'

export function LastWorkoutCard({ log }: { log: WorkoutHistoryLog }) {
  const metrics = [
    { value: formatNumber(log.totalVolumeKg), unit: 'кг' },
    { value: log.totalSets, unit: 'підх.' },
    { value: log.exercises.length, unit: 'вправ' },
  ]

  return (
    <DashboardSection
      title="Останнє тренування"
      aside={
        <Link to="/progress" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover">
          Журнал <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      <Link to="/progress" className="block rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong sm:p-5">
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
    </DashboardSection>
  )
}
