import { useEffect, useMemo, useState } from 'react'
import { BookOpen, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import {
  deleteWorkoutLogAsync,
  EditWorkoutModal,
  fetchProgress,
  filterJournal,
  groupByMonth,
  JournalCalendar,
  JournalEntry,
  ListSkeleton,
  ProgressTabs,
  recordExerciseIds,
  updateWorkoutLogAsync,
  type WorkoutHistoryLog,
} from '@/features/progress'
import { SEO } from '@/shared/seo/SEO'
import { SESSION_KEYS } from '@/shared/storage/sessionStorage'
import { useSessionState } from '@/shared/storage/useSessionState'
import { formatHoursMinutes, formatNumber } from '@/shared/lib/formatters'
import { Button, confirmAction, EmptyState, PageHeader, SearchInput, Select } from '@/shared/ui'
import { PAGE_META } from '../meta'

const monthTitle = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' })
const toMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`
const fromMonthKey = (key: string) => {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

export function JournalPage() {
  const dispatch = useAppDispatch()
  const { history, personalRecords, status } = useAppSelector((state) => state.progress)
  const [view, setView] = useSessionState(SESSION_KEYS.JOURNAL_VIEW, { query: '', plan: '', month: '' })
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [editing, setEditing] = useState<WorkoutHistoryLog | null>(null)

  const saveEdit = async (log: WorkoutHistoryLog) => {
    await dispatch(updateWorkoutLogAsync(log)).unwrap()
    toast.success('Зміни збережено')
  }

  useEffect(() => {
    if (history.length === 0) dispatch(fetchProgress())
  }, [dispatch, history.length])

  const latestMonth = useMemo(() => {
    const latest = history.reduce<string | null>((max, log) => (!max || log.date > max ? log.date : max), null)
    return toMonthKey(latest ? new Date(latest) : new Date(2026, 0, 1))
  }, [history])
  const month = fromMonthKey(view.month || latestMonth)

  const plans = useMemo(() => [...new Set(history.map((log) => log.planName))].sort((a, b) => a.localeCompare(b, 'uk')), [history])
  const filtered = useMemo(() => filterJournal(history, view), [history, view])
  const groups = useMemo(() => groupByMonth(filtered), [filtered])
  const isFiltered = Boolean(view.query.trim() || view.plan)
  const isLoading = (status === 'idle' || status === 'loading') && history.length === 0

  const handleDelete = async (id: string) => {
    const confirmed = await confirmAction({
      title: 'Видалити тренування з журналу?',
      description: 'Особисті рекорди буде перераховано.',
      confirmLabel: 'Видалити',
      destructive: true,
    })
    if (!confirmed) return
    await dispatch(deleteWorkoutLogAsync(id))
    toast.success('Запис видалено')
  }

  const showDay = (log: WorkoutHistoryLog) => {
    setView((v) => ({ ...v, query: '', plan: '' }))
    setHighlighted(log.id)
    requestAnimationFrame(() => document.getElementById(`log-${log.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    window.setTimeout(() => setHighlighted((current) => (current === log.id ? null : current)), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SEO {...PAGE_META.journal} />
      <PageHeader compact title="Прогрес" description="Журнал тренувань і особисті рекорди" />
      <ProgressTabs />

      {isLoading ? (
        <ListSkeleton label="Завантаження журналу" count={5} />
      ) : history.length === 0 ? (
        <EmptyState icon={<BookOpen />} title="Журнал порожній" description="Завершіть перше тренування, і воно з'явиться тут." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="min-w-0 space-y-6 lg:order-2 lg:sticky lg:top-6">
            <JournalCalendar
              month={month}
              history={history}
              onMonthChange={(next) => setView((v) => ({ ...v, month: toMonthKey(next) }))}
              onSelectDay={showDay}
            />
          </div>

          <div className="min-w-0 space-y-6 lg:order-1">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <SearchInput
                label="Пошук у журналі"
                placeholder="Вправа, день або програма"
                value={view.query}
                onChange={(query) => setView((v) => ({ ...v, query }))}
              />
              <Select
                aria-label="Програма"
                value={view.plan}
                onChange={(e) => setView((v) => ({ ...v, plan: e.target.value }))}
                options={[{ value: '', label: 'Усі програми' }, ...plans.map((plan) => ({ value: plan, label: plan }))]}
              />
            </div>

            {groups.length === 0 ? (
              <EmptyState
                icon={<SearchX />}
                title="Нічого не знайдено"
                description="Спробуйте іншу вправу або скиньте фільтр програми."
                action={
                  isFiltered && (
                    <Button variant="outline" size="sm" onClick={() => setView((v) => ({ ...v, query: '', plan: '' }))}>
                      Скинути фільтри
                    </Button>
                  )
                }
              />
            ) : (
              groups.map((group) => (
                <section key={group.key} aria-label={monthTitle.format(group.month)} className="space-y-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-fg-muted">{monthTitle.format(group.month)}</h2>
                    <span className="font-mono text-xs text-fg-subtle tabular">
                      {group.totals.workouts} трен. · {formatNumber(group.totals.volumeKg / 1000, 1)} т · {formatHoursMinutes(group.totals.seconds)}
                    </span>
                  </div>
                  <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
                    {group.logs.map((log) => (
                      <JournalEntry
                        key={log.id}
                        log={log}
                        records={recordExerciseIds(log, personalRecords)}
                        highlighted={highlighted === log.id}
                        onDelete={handleDelete}
                    onEdit={setEditing}
                      />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        </div>
      )}
      {editing && <EditWorkoutModal key={editing.id} log={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
    </div>
  )
}
