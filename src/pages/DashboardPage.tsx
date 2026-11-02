import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Calendar, Play } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { SEO } from '@/components/common/SEO'
import { Button, SectionLabel, Stat } from '@/components/ui'
import { PHOTOS } from '@/data/photos'
import { MUSCLE_GROUP_LABELS } from '@/features/exercises/model/types'
import { FITNESS_GOAL_LABELS } from '@/features/profile/model/types'
import { DAY_LABELS, type DayOfWeek } from '@/features/workoutPlan/model/types'
import { startWorkout } from '@/features/workoutSession/model/workoutSessionSlice'
import { formatDate, formatDuration, formatNumber } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const DAY_KEYS: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const HERO_LIST_LIMIT = 5

function getCurrentDayOfWeek(): DayOfWeek {
  return DAY_KEYS[new Date().getDay()]
}

function formatToday() {
  return new Intl.DateTimeFormat('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
}

const TOOLS = [
  { to: '/exercises', title: 'Вправи', caption: 'Анатомія, фази руху та техніка' },
  { to: '/plans', title: 'Програми', caption: 'Тижневі спліти та розклад' },
  { to: '/progress', title: 'Прогрес', caption: 'Журнал сесій та особисті рекорди' },
]

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const profile = useAppSelector((state) => state.profile.profile)
  const plansState = useAppSelector((state) => state.workoutPlan)
  const exercises = useAppSelector((state) => state.exercises.items)
  const progress = useAppSelector((state) => state.progress)
  const session = useAppSelector((state) => state.workoutSession)

  const [currentDayKey] = useState<DayOfWeek>(getCurrentDayOfWeek)
  const [todayLabel] = useState(formatToday)

  const activePlan = plansState.plans.find((p) => p.id === plansState.activePlanId) || plansState.plans[0]
  const todayExercises = activePlan?.schedule[currentDayKey] || []
  const isTrainingDay = todayExercises.length > 0

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])

  const totalWorkouts = progress.history.length
  const totalVolumeKg = progress.history.reduce((sum, log) => sum + log.totalVolumeKg, 0)
  const totalSeconds = progress.history.reduce((sum, log) => sum + log.durationSeconds, 0)
  const totalPrs = Object.keys(progress.personalRecords).length
  const totalSetsToday = todayExercises.reduce((sum, e) => sum + e.sets, 0)

  const latestPr = useMemo(
    () =>
      Object.values(progress.personalRecords).sort(
        (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime(),
      )[0],
    [progress.personalRecords],
  )

  const handleStart = () => {
    if (session.isActive || !isTrainingDay) {
      navigate('/workout')
      return
    }
    dispatch(
      startWorkout({
        planId: activePlan?.id || null,
        dayLabel: `${DAY_LABELS[currentDayKey]} (${activePlan?.name})`,
        exercises: todayExercises,
      }),
    )
    navigate('/workout')
  }

  return (
    <div className="space-y-16 lg:space-y-24">
      <SEO
        title="Головна панель"
        description="FitPulse — Щоденник та планувальник силових тренувань: фокус дня, показники тоннажу та швидкий старт."
      />

      {/* ── HERO + INFO STRIP ─────────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="-mx-5 sm:mx-0">
        <div className="relative isolate overflow-hidden sm:rounded-t-lg">
          <img
            src={PHOTOS.heroRunner.src}
            alt=""
            className="absolute inset-0 -z-10 size-full object-cover object-[70%_center]"
            fetchPriority="high"
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-scrim/90 via-scrim/60 to-scrim/20"
            aria-hidden="true"
          />

          <div className="grid min-h-[520px] gap-10 px-6 py-10 text-on-photo sm:px-10 lg:min-h-[600px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:px-14 lg:py-14">
            {/* Ліва колонка: індекс і список вправ — як «/ 01 Work Collection» у референсі */}
            <div className="hidden flex-col justify-center gap-4 sm:flex lg:max-w-xs">
              <div className="flex items-baseline gap-3 font-mono text-sm text-accent">
                / {String(DAY_KEYS.indexOf(currentDayKey) || 7).padStart(2, '0')}
              </div>
              <div className="relative h-px w-full bg-on-photo/20" aria-hidden="true">
                <div className="absolute inset-y-0 left-0 w-2/3 bg-accent" />
              </div>
              <p className="text-sm font-semibold">{activePlan?.name || 'План не обрано'}</p>
              {isTrainingDay ? (
                <ul className="space-y-1.5 text-xs text-on-photo/60">
                  {todayExercises.slice(0, HERO_LIST_LIMIT).map((item) => (
                    <li key={item.id} className="truncate">
                      {exerciseMap.get(item.exerciseId)?.name || 'Вправа'}
                    </li>
                  ))}
                  {todayExercises.length > HERO_LIST_LIMIT && (
                    <li>+ ще {todayExercises.length - HERO_LIST_LIMIT}</li>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-on-photo/60">За розкладом сьогодні тренувань немає</p>
              )}
            </div>

            {/* Права колонка: великий заголовок і CTA */}
            <div className="flex flex-col justify-center">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-on-photo/70 first-letter:uppercase">
                {todayLabel} · {FITNESS_GOAL_LABELS[profile.fitnessGoal] || 'Сила та форма'}
              </p>
              <h1 id="hero-title" className="text-6xl leading-[1.05] sm:text-7xl lg:text-8xl">
                {isTrainingDay ? (
                  <>
                    Тренуйся
                    <br />
                    сьогодні
                  </>
                ) : (
                  <>
                    День
                    <br />
                    відновлення
                  </>
                )}
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-on-photo/75 sm:text-base">
                {isTrainingDay ? (
                  <>
                    {profile.name ? `${profile.name}, у` : 'У'} плані {todayExercises.length} вправ і {totalSetsToday} підходів —
                    приблизно {todayExercises.length * 10}–{todayExercises.length * 12} хвилин роботи.
                  </>
                ) : (
                  <>Відпочинок — частина програми. Або почніть вільне заняття, якщо є енергія.</>
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={handleStart} icon={<Play className="fill-current" />}>
                  {session.isActive
                    ? `Продовжити · ${formatDuration(session.elapsedSeconds)}`
                    : isTrainingDay
                      ? 'Почати тренування'
                      : 'Вільне тренування'}
                </Button>
                <Link
                  to="/plans"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-on-photo/30 px-6 text-sm font-semibold uppercase tracking-wide text-on-photo transition-colors hover:border-on-photo hover:bg-on-photo/10"
                >
                  <Calendar className="size-4" aria-hidden="true" />
                  Розклад
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Нижня смуга: план дня · фото · рекорд */}
        <div className="grid border-x-0 border-b border-line bg-surface sm:rounded-b-lg sm:border-x md:grid-cols-[1.3fr_0.7fr_1fr]">
          <div className="space-y-4 p-6 sm:p-8">
            <h2 className="font-sans text-xs font-bold tracking-[0.2em] text-fg">План на сьогодні</h2>
            {isTrainingDay ? (
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {todayExercises.slice(0, 4).map((item) => {
                  const ex = exerciseMap.get(item.exerciseId)
                  return (
                    <li key={item.id} className="min-w-0 text-xs">
                      <span className="block truncate font-semibold text-fg-muted">{ex?.name || 'Вправа'}</span>
                      <span className="font-mono font-semibold text-fg tabular">
                        {item.sets} × {item.reps}
                        {item.weight ? ` · ${item.weight} кг` : ''}
                      </span>
                      {ex && <span className="ml-2 text-fg-subtle">{MUSCLE_GROUP_LABELS[ex.primaryMuscle]}</span>}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-fg-muted">Відпочинок і відновлення. Наступне тренування — за розкладом програми.</p>
            )}
          </div>

          <div className="relative hidden min-h-[180px] md:block">
            <img src={PHOTOS.deadlift.src} alt={PHOTOS.deadlift.alt} loading="lazy" className="absolute inset-0 size-full object-cover" />
          </div>

          <div className="space-y-4 border-t border-line p-6 sm:p-8 md:border-t-0">
            <h2 className="font-sans text-xs font-bold tracking-[0.2em] text-fg">Останній рекорд</h2>
            {latestPr ? (
              <>
                <p className="text-sm text-fg-muted">
                  {latestPr.exerciseName} ·{' '}
                  <span className="font-mono font-semibold text-fg tabular">
                    {latestPr.maxWeightKg > 0 ? `${latestPr.maxWeightKg} кг` : `${latestPr.maxReps} повт.`}
                  </span>
                  <span className="block text-xs text-fg-subtle">{formatDate(latestPr.achievedAt)}</span>
                </p>
                <Link to="/progress" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover">
                  Усі рекорди <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-fg-muted">Завершіть перше тренування, щоб зафіксувати рекорд.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── METRICS ───────────────────────────────────────────────────── */}
      <section aria-labelledby="metrics-title" className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <SectionLabel index={1}>
            <span id="metrics-title">Ваш прогрес</span>
          </SectionLabel>
          <Link to="/progress" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover">
            Аналітика <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-y-10 border-t border-line pt-8 lg:grid-cols-4">
          <Stat label="Тоннаж" value={formatNumber(totalVolumeKg)} unit="кг" accent size="lg" />
          <Stat label="Сесій" value={totalWorkouts} size="lg" />
          <Stat label="Рекордів" value={totalPrs} size="lg" />
          <Stat label="У залі" value={formatNumber(totalSeconds / 3600, 1)} unit="год" size="lg" />
        </div>
      </section>

      {/* ── TOOLS ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="tools-title" className="space-y-8">
        <SectionLabel index={2}>
          <span id="tools-title">Інструменти</span>
        </SectionLabel>
        <ul className="border-t border-line">
          {TOOLS.map((tool, i) => (
            <li key={tool.to} className="border-b border-line">
              <Link to={tool.to} className="group flex items-center gap-6 py-6 sm:gap-10 sm:py-8">
                <span className="w-8 font-mono text-sm text-fg-subtle transition-colors group-hover:text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">
                  <span className="block font-display text-3xl uppercase text-fg transition-colors group-hover:text-accent sm:text-5xl">
                    {tool.title}
                  </span>
                  <span className="mt-1 block text-sm text-fg-muted">{tool.caption}</span>
                </span>
                <ArrowUpRight
                  className={cn(
                    'size-6 shrink-0 text-fg-subtle transition-[color,transform] duration-300',
                    'group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent',
                  )}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
