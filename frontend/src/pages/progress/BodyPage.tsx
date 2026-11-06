import { useEffect, useMemo, useState } from 'react'
import { Ruler, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { BODY_METRICS, BodyEntryForm, addBodyEntry, fetchBody, metricSeries, metricTrend, removeBodyEntry, type BodyMetric } from '@/features/body'
import { ProgressTabs } from '@/features/progress'
import { SEO } from '@/shared/seo/SEO'
import { formatDate, formatNumber } from '@/shared/lib/formatters'
import { LineChart } from '@/shared/ui/charts'
import { EmptyState, IconButton, PageHeader, Section, SegmentedControl } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { PAGE_META } from '../meta'

const shortDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' })
const longDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })

export function BodyPage() {
  const dispatch = useAppDispatch()
  const { entries, status } = useAppSelector((state) => state.body)
  const [metric, setMetric] = useState<BodyMetric>('weightKg')
  const [now] = useState(() => new Date())

  useEffect(() => {
    if (status === 'idle') dispatch(fetchBody())
  }, [dispatch, status])

  const info = BODY_METRICS.find((m) => m.key === metric)!
  const points = useMemo(
    () =>
      metricSeries(entries, metric).map((p) => {
        const date = new Date(p.date)
        return { key: p.date, x: date.getTime(), value: p.value, label: shortDate.format(date), title: longDate.format(date) }
      }),
    [entries, metric],
  )

  const save = async (entry: Parameters<typeof addBodyEntry>[0]) => {
    await dispatch(addBodyEntry(entry)).unwrap()
    toast.success('Вимір збережено')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <SEO {...PAGE_META.body} />
      <PageHeader compact title="Прогрес" description="Вага й обхвати тіла" />
      <ProgressTabs />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {BODY_METRICS.map((m) => {
          const trend = metricTrend(entries, m.key, { now })
          return (
            <button
              key={m.key}
              type="button"
              aria-pressed={metric === m.key}
              onClick={() => setMetric(m.key)}
              className={cn('cursor-pointer rounded-lg border bg-surface p-3 text-left transition-colors', metric === m.key ? 'border-accent' : 'border-line hover:border-line-strong')}
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">{m.label}</span>
              <span className="mt-1 block font-mono text-lg font-semibold text-fg tabular">{trend ? `${formatNumber(trend.value, 1)} ${m.unit}` : '—'}</span>
              {trend && trend.change !== 0 && (
                <span className="block text-xs text-fg-muted">
                  {trend.change > 0 ? '+' : ''}
                  {formatNumber(trend.change, 1)} за 30 днів
                </span>
              )}
            </button>
          )
        })}
      </div>

      <Section title={`Динаміка: ${info.label.toLowerCase()}`} aside={<SegmentedControl label="Показник" size="sm" options={BODY_METRICS.map((m) => ({ value: m.key, label: m.label }))} value={metric} onChange={setMetric} className="hidden sm:inline-flex" />}>
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          {points.length < 2 ? (
            <p className="py-8 text-center text-sm text-fg-muted">Додайте щонайменше два виміри, щоб побачити графік.</p>
          ) : (
            <LineChart data={points} ariaLabel={`${info.label} з часом`} formatValue={(v) => `${formatNumber(v, 1)} ${info.unit}`} formatTick={(v) => formatNumber(v, 1)} />
          )}
        </div>
      </Section>

      <Section title="Новий вимір">
        <BodyEntryForm onSave={save} />
      </Section>

      <Section title="Усі виміри">
        {entries.length === 0 ? (
          <EmptyState icon={<Ruler />} title="Вимірів ще немає" description="Записуйте вагу й обхвати раз на тиждень зранку, щоб бачити, як змінюється тіло." />
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span className="w-24 shrink-0 text-sm text-fg">{formatDate(entry.date)}</span>
                <span className="min-w-0 flex-1 font-mono text-xs text-fg-muted tabular">
                  {BODY_METRICS.filter((m) => entry[m.key] !== undefined)
                    .map((m) => `${m.label.toLowerCase()} ${formatNumber(entry[m.key]!, 1)} ${m.unit}`)
                    .join(' · ')}
                </span>
                <IconButton size="sm" label={`Видалити вимір від ${formatDate(entry.date)}`} icon={<Trash2 />} onClick={() => dispatch(removeBodyEntry(entry.id))} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
