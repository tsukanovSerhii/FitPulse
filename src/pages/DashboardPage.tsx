import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Clock, Play } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { SEO } from '@/components/common/SEO'
import { Button, Card, ProgressBar, Stat, buttonClasses } from '@/components/ui'
import { AdSlot } from '@/features/ads/components/AdSlot'
import { dayKeyOf, nextTrainingDay, startOfWeek, WEEK_DAYS } from '@/features/dashboard/lib/week'
import { MUSCLE_GROUP_LABELS } from '@/features/exercises/model/types'
import { DAY_LABELS, DAY_SHORT_LABELS, type DayOfWeek } from '@/features/workoutPlan/model/types'
import { startWorkout } from '@/features/workoutSession/model/workoutSessionSlice'
import { formatDate, formatDuration, formatNumber } from '@/utils/formatters'
import { cn } from '@/utils/cn'

function greeting(hour: number) {
  if (hour < 12) return 'Доброго ранку'
  if (hour < 18) return 'Доброго дня'
  return 'Доброго вечора'
}

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const profile = useAppSelector((state) => state.profile.profile)
  const plansState = useAppSelector((state) => state.workoutPlan)
  const exercises = useAppSelector((state) => state.exercises.items)
  const history = useAppSelector((state) => state.progress.history)
  const personalRecords = useAppSelector((state) => state.progress.personalRecords)
  const session = useAppSelector((state) => state.workoutSession)

  const [now] = useState(() => new Date())
  const today = dayKeyOf(now)

  const activePlan = plansState.plans.find((p) => p.id === plansState.activePlanId) || plansState.plans[0]
  const todayExercises = activePlan?.schedule[today] || []
  const isTrainingDay = todayExercises.length > 0
  const totalSetsToday = todayExercises.reduce((sum, e) => sum + e.sets, 0)
  const nextDay = activePlan ? nextTrainingDay(today, (d) => (activePlan.schedule[d]?.length ?? 0) > 0) : null

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])

  const weekStart = startOfWeek(now).getTime()
  const weekLogs = useMemo(() => history.filter((log) => new Date(log.date).getTime() >= weekStart), [history, weekStart])
  const doneDays = new Set<DayOfWeek>(weekLogs.map((log) => dayKeyOf(new Date(log.date))))
  const weekVolume = weekLogs.reduce((sum, log) => sum + log.totalVolumeKg, 0)
  const plannedThisWeek = activePlan ? WEEK_DAYS.filter((d) => (activePlan.schedule[d]?.length ?? 0) > 0).length : 0

  const lastLog = useMemo(
    () => [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
    [history],
  )

  const sessionDone = Object.values(session.completedSets).reduce((sum, sets) => sum + sets.length, 0)
  const sessionTotal = session.exercises.reduce((sum, e) => sum + e.sets, 0)

  const handleStart = () => {
    if (!session.isActive && isTrainingDay && activePlan) {
      dispatch(
        startWorkout({
          planId: activePlan.id,
          dayLabel: `${DAY_LABELS[today]} (${activePlan.name})`,
          exercises: todayExercises,
        }),
      )
    }
    navigate('/workout')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 lg:space-y-8">
      <SEO title="Головна" description="Тренування на сьогодні, тиждень і прогрес." />

      <header>
        <p className="text-sm text-fg-subtle first-letter:uppercase">
          {new Intl.DateTimeFormat('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)}
        </p>
        <h1 className="mt-1 font-sans text-2xl font-bold normal-case tracking-tight sm:text-3xl">
          {greeting(now.getHours())}, {profile.name.split(' ')[0] || 'атлете'}
        </h1>
      </header>

      <Card padding="none" className="overflow-hidden">
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
            <span className="text-accent">{session.isActive ? 'Триває зараз' : 'Сьогодні'}</span>
            <span className="truncate text-fg-subtle">{activePlan?.name || 'Програму не обрано'}</span>
          </div>

          {session.isActive ? (
            <>
              <div>
                <p className="font-mono text-5xl font-semibold tabular text-fg">{formatDuration(session.elapsedSeconds)}</p>
                <p className="mt-2 text-sm text-fg-muted">
                  {sessionDone} з {sessionTotal} підходів виконано
                </p>
              </div>
              <ProgressBar value={sessionTotal ? (sessionDone / sessionTotal) * 100 : 0} label="Прогрес тренування" />
            </>
          ) : isTrainingDay ? (
            <>
              <div>
                <h2 className="text-4xl text-fg sm:text-5xl">{DAY_LABELS[today]}</h2>
                <p className="mt-2 text-sm text-fg-muted">
                  {todayExercises.length} вправ · {totalSetsToday} підходів · ~{todayExercises.length * 11} хв
                </p>
              </div>
              <ol className="divide-y divide-line border-y border-line">
                {todayExercises.map((item, i) => {
                  const ex = exerciseMap.get(item.exerciseId)
                  return (
                    <li key={item.id} className="flex items-center gap-4 py-3 text-sm">
                      <span className="w-5 font-mono text-xs text-fg-subtle">{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-fg">{ex?.name || 'Вправа'}</span>
                        {ex && <span className="text-xs text-fg-subtle">{MUSCLE_GROUP_LABELS[ex.primaryMuscle]}</span>}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-fg-muted tabular">
                        {item.sets}×{item.reps}
                        {item.weight ? ` · ${item.weight} кг` : ''}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </>
          ) : (
            <div>
              <h2 className="text-4xl text-fg sm:text-5xl">Відновлення</h2>
              <p className="mt-2 text-sm text-fg-muted">
                За програмою сьогодні відпочинок.
                {nextDay && <> Наступне тренування — {DAY_LABELS[nextDay].toLowerCase()}.</>}
              </p>
            </div>
          )}

          <Button size="lg" className="w-full" onClick={handleStart} icon={<Play className="fill-current" />}>
            {session.isActive ? 'Продовжити тренування' : isTrainingDay ? 'Почати тренування' : 'Вільне тренування'}
          </Button>
        </div>
      </Card>

      <AdSlot placement="dashboard" />

      <section aria-labelledby="week-title" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 id="week-title" className="font-sans text-xs font-bold tracking-[0.16em] text-fg-muted">
            Цей тиждень
          </h2>
          <span className="font-mono text-xs text-fg-subtle tabular">
            {doneDays.size} / {plannedThisWeek}
          </span>
        </div>
        <ol className="grid grid-cols-7 gap-1.5">
          {WEEK_DAYS.map((day) => {
            const planned = (activePlan?.schedule[day]?.length ?? 0) > 0
            const done = doneDays.has(day)
            const isToday = day === today
            return (
              <li
                key={day}
                aria-label={`${DAY_LABELS[day]}: ${done ? 'виконано' : planned ? 'заплановано' : 'відпочинок'}`}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-1 rounded-md border text-xs font-semibold sm:h-16',
                  done && 'border-accent bg-accent text-on-accent',
                  !done && planned && 'border-line-strong text-fg',
                  !done && !planned && 'border-line text-fg-subtle',
                  isToday && !done && 'border-accent text-accent',
                )}
              >
                {DAY_SHORT_LABELS[day]}
                {done ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : (
                  <span className={cn('size-1 rounded-full', planned ? 'bg-current' : 'bg-transparent')} aria-hidden="true" />
                )}
              </li>
            )
          })}
        </ol>
      </section>

      <section aria-label="Підсумки" className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-surface">
        <Stat className="p-4 sm:p-5" label="Тренувань" value={weekLogs.length} hint="цього тижня" />
        <Stat className="p-4 sm:p-5" label="Тоннаж" value={formatNumber(weekVolume / 1000, 1)} unit="т" hint="цього тижня" />
        <Stat className="p-4 sm:p-5" label="Рекорди" value={Object.keys(personalRecords).length} hint="усього" accent />
      </section>

      {lastLog && (
        <section aria-labelledby="last-title" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 id="last-title" className="font-sans text-xs font-bold tracking-[0.16em] text-fg-muted">
              Останнє тренування
            </h2>
            <Link to="/progress" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover">
              Журнал <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <Link to="/progress" className="block rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-fg">{lastLog.dayLabel || lastLog.planName}</p>
                <p className="mt-1 text-xs text-fg-subtle">{formatDate(lastLog.date)}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-fg-muted tabular">
                <Clock className="size-3.5" aria-hidden="true" />
                {formatDuration(lastLog.durationSeconds)}
              </span>
            </div>
            <div className="mt-4 flex gap-6 font-mono text-sm tabular">
              <span>
                <span className="text-fg">{formatNumber(lastLog.totalVolumeKg)}</span> <span className="text-fg-subtle">кг</span>
              </span>
              <span>
                <span className="text-fg">{lastLog.totalSets}</span> <span className="text-fg-subtle">підх.</span>
              </span>
              <span>
                <span className="text-fg">{lastLog.exercises.length}</span> <span className="text-fg-subtle">вправ</span>
              </span>
            </div>
          </Link>
        </section>
      )}

      {!activePlan && (
        <Link to="/plans" className={buttonClasses('outline', 'md', 'w-full')}>
          Обрати програму
        </Link>
      )}
    </div>
  )
}
