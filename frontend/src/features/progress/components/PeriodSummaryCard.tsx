import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Trophy } from 'lucide-react'
import { Section, SegmentedControl } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatHoursMinutes, formatNumber } from '@/shared/lib/formatters'
import { percentChange, periodSummary, type Period } from '../lib/period'
import type { WorkoutHistoryLog } from '../model/types'

function Delta({ now, before }: { now: number; before: number }) {
  const change = percentChange(now, before)
  if (change === null) return <span className="text-xs text-fg-subtle">—</span>
  return (
    <span className={cn('text-xs font-semibold', change > 0 ? 'text-success' : change < 0 ? 'text-danger' : 'text-fg-subtle')}>
      {change > 0 ? '+' : ''}
      {change} %
    </span>
  )
}

export function PeriodSummaryCard({ history, now }: { history: WorkoutHistoryLog[]; now: Date }) {
  const [period, setPeriod] = useState<Period>('week')
  const summary = periodSummary(history, period, now)
  const { current, previous } = summary
  const label = period === 'week' ? 'минулим тижнем' : 'минулим місяцем'
  const cells = [
    { title: 'Тренувань', value: String(current.workouts), now: current.workouts, before: previous.workouts },
    { title: 'Тоннаж', value: `${formatNumber(current.volumeKg / 1000, 1)} т`, now: current.volumeKg, before: previous.volumeKg },
    { title: 'Час', value: formatHoursMinutes(current.seconds), now: current.seconds, before: previous.seconds },
  ]

  return (
    <Section
      title="Підсумок"
      aside={
        <SegmentedControl
          label="Період"
          size="sm"
          options={[
            { value: 'week', label: 'Тиждень' },
            { value: 'month', label: 'Місяць' },
          ]}
          value={period}
          onChange={setPeriod}
        />
      }
    >
      <div className="space-y-4 rounded-lg border border-line bg-surface p-4 sm:p-5">
        <dl className="grid grid-cols-3 gap-3">
          {cells.map((cell) => (
            <div key={cell.title} className="min-w-0">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">{cell.title}</dt>
              <dd className="mt-1 font-mono text-lg font-semibold text-fg tabular">{cell.value}</dd>
              <dd>
                <Delta now={cell.now} before={cell.before} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-fg-subtle">Порівняння з {label}.</p>
        {(summary.records > 0 || summary.topGain) && (
          <ul className="space-y-2 border-t border-line pt-3 text-sm text-fg-muted">
            {summary.records > 0 && (
              <li className="flex items-center gap-2">
                <Trophy className="size-4 text-warning" aria-hidden="true" />
                Нових рекордів: <span className="font-semibold text-fg">{summary.records}</span>
              </li>
            )}
            {summary.topGain && (
              <li className="flex items-center gap-2">
                <TrendingUp className="size-4 text-accent" aria-hidden="true" />
                <span className="min-w-0">
                  Найбільший прогрес:{' '}
                  <Link to={`/progress/exercise/${summary.topGain.exerciseId}`} className="font-semibold text-fg hover:text-accent">
                    {summary.topGain.name}
                  </Link>{' '}
                  <span className="font-mono tabular">
                    {formatNumber(summary.topGain.fromKg, 1)} → {formatNumber(summary.topGain.toKg, 1)} кг
                  </span>
                </span>
              </li>
            )}
          </ul>
        )}
      </div>
    </Section>
  )
}
