import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, History } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { fetchExercises } from '@/features/exercises'
import { exerciseSessions, exerciseStats, fetchProgress, ListSkeleton, loggedName, type ExerciseSession } from '@/features/progress'
import { SEO } from '@/shared/seo/SEO'
import { formatDate, formatNumber, plural } from '@/shared/lib/formatters'
import { LineChart } from '@/shared/ui/charts'
import { EmptyState, PageHeader, Section, SegmentedControl, Stat } from '@/shared/ui'
import { PAGE_META } from '../meta'

type Period = '3' | '6' | '12' | 'all'
type Metric = 'weight' | 'oneRepMax'

const PERIODS: { value: Period; label: string }[] = [
  { value: '3', label: '3 міс' },
  { value: '6', label: '6 міс' },
  { value: '12', label: 'Рік' },
  { value: 'all', label: 'Усе' },
]

const shortDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' })
const longDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
const kg = (value: number) => `${formatNumber(value, 1)} кг`

function SessionSets({ session }: { session: ExerciseSession }) {
  if (session.loggedSets?.length) {
    return (
      <span className="flex flex-wrap justify-end gap-x-2 gap-y-0.5">
        {session.loggedSets.map((set, i) => (
          <span key={i}>
            {set.weight ? `${formatNumber(set.weight, 1)}×${set.reps}` : `${set.reps}`}
            {set.kind === 'drop' ? ' дроп' : set.kind === 'failure' ? ' відм.' : ''}
          </span>
        ))}
      </span>
    )
  }
  const average = Math.round(session.totalReps / Math.max(session.sets, 1))
  return (
    <span>
      {session.sets} × {average}
      {session.maxWeightKg ? ` · до ${kg(session.maxWeightKg)}` : ''}
    </span>
  )
}

export function ExerciseHistoryPage() {
  const { exerciseId = '' } = useParams()
  const dispatch = useAppDispatch()
  const { history, status } = useAppSelector((state) => state.progress)
  const catalog = useAppSelector((state) => state.exercises.items)
  const [period, setPeriod] = useState<Period>('all')
  const [metric, setMetric] = useState<Metric>('weight')

  useEffect(() => {
    if (history.length === 0) dispatch(fetchProgress())
    if (catalog.length === 0) dispatch(fetchExercises())
  }, [dispatch, history.length, catalog.length])

  const name = catalog.find((e) => e.id === exerciseId)?.name ?? loggedName(history, exerciseId) ?? 'Вправа'
  const sessions = useMemo(() => exerciseSessions(history, exerciseId, { months: period === 'all' ? undefined : Number(period) }), [history, exerciseId, period])
  const stats = useMemo(() => exerciseStats(sessions), [sessions])
  const points = useMemo(
    () =>
      [...sessions]
        .reverse()
        .flatMap((s) => {
          const value = metric === 'weight' ? s.maxWeightKg : s.oneRepMax
          if (!value) return []
          const date = new Date(s.date)
          return [{ key: s.logId, x: date.getTime(), value, label: shortDate.format(date), title: longDate.format(date), detail: s.repsAtMaxWeight ? `× ${s.repsAtMaxWeight}` : undefined }]
        }),
    [sessions, metric],
  )
  const isLoading = (status === 'idle' || status === 'loading') && history.length === 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SEO {...PAGE_META.exerciseHistory} />
      <Link to="/progress" className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Прогрес
      </Link>
      <PageHeader compact title={name} description="Історія вправи" />

      {isLoading ? (
        <ListSkeleton label="Завантаження історії" count={4} />
      ) : (
        <>
          <SegmentedControl label="Період" size="sm" options={PERIODS} value={period} onChange={setPeriod} />

          {sessions.length === 0 ? (
            <EmptyState icon={<History />} title="Тренувань з цією вправою немає" description="Коли ви виконаєте її в тренуванні, тут з’являться вага, підходи й графік." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-lg border border-line bg-surface p-4 sm:grid-cols-4 sm:p-5">
                <Stat label="Найкраща вага" value={stats.bestWeight ? formatNumber(stats.bestWeight.weightKg, 1) : '—'} unit={stats.bestWeight ? 'кг' : undefined} accent />
                <Stat label="1ПМ, оцінка" value={stats.bestOneRepMax ? formatNumber(stats.bestOneRepMax.value, 1) : '—'} unit={stats.bestOneRepMax ? 'кг' : undefined} />
                <Stat label="Тренувань" value={stats.sessions} />
                <Stat label="Останнє" value={stats.lastDate ? shortDate.format(new Date(stats.lastDate)) : '—'} />
              </div>

              {points.length >= 2 && (
                <Section
                  title="Динаміка"
                  aside={
                    <SegmentedControl
                      label="Показник"
                      size="sm"
                      options={[
                        { value: 'weight', label: 'Вага' },
                        { value: 'oneRepMax', label: '1ПМ' },
                      ]}
                      value={metric}
                      onChange={setMetric}
                    />
                  }
                >
                  <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
                    <LineChart
                      data={points}
                      ariaLabel={metric === 'weight' ? `Найкраща вага: ${name}` : `Оцінка 1ПМ: ${name}`}
                      formatValue={kg}
                      formatTick={(v) => formatNumber(v, 1)}
                    />
                  </div>
                </Section>
              )}

              <Section title="Усі тренування" aside={<span className="text-xs text-fg-subtle">{plural(sessions.length, ['тренування', 'тренування', 'тренувань'])}</span>}>
                <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                  {sessions.map((session) => (
                    <li key={session.logId} className="flex items-baseline justify-between gap-4 px-4 py-3 sm:px-5">
                      <span className="shrink-0 text-sm text-fg">{formatDate(session.date)}</span>
                      <span className="min-w-0 text-right font-mono text-xs text-fg-muted tabular">
                        <SessionSets session={session} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            </>
          )}
        </>
      )}
    </div>
  )
}
