import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { SEO } from '@/components/common/SEO'
import { Stat, buttonClasses } from '@/components/ui'
import { AdSlot } from '@/features/ads/components/AdSlot'
import { LastWorkoutCard } from '@/features/dashboard/components/LastWorkoutCard'
import { TodayCard } from '@/features/dashboard/components/TodayCard'
import { WeekStrip } from '@/features/dashboard/components/WeekStrip'
import { useDashboardData } from '@/features/dashboard/lib/useDashboardData'
import { DAY_LABELS } from '@/features/workoutPlan/model/types'
import { startWorkout } from '@/features/workoutSession/model/workoutSessionSlice'
import { formatNumber } from '@/utils/formatters'

function greeting(hour: number) {
  if (hour < 12) return 'Доброго ранку'
  if (hour < 18) return 'Доброго дня'
  return 'Доброго вечора'
}

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const userName = useAppSelector((state) => state.auth.user?.name ?? state.profile.profile.name)
  const data = useDashboardData()
  const { now, today, session, activePlan, todayExercises } = data

  const handleStart = () => {
    if (!session.isActive && todayExercises.length > 0 && activePlan) {
      dispatch(startWorkout({ planId: activePlan.id, dayLabel: `${DAY_LABELS[today]} (${activePlan.name})`, exercises: todayExercises }))
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
          {greeting(now.getHours())}, {userName.split(' ')[0] || 'атлете'}
        </h1>
      </header>

      <TodayCard
        today={today}
        planName={activePlan?.name}
        exercises={todayExercises}
        exerciseMap={data.exerciseMap}
        session={session}
        nextDay={data.nextDay}
        onStart={handleStart}
      />

      <AdSlot placement="dashboard" />

      <WeekStrip today={today} doneDays={data.doneDays} isPlanned={data.isPlanned} plannedCount={data.plannedThisWeek} />

      <section aria-label="Підсумки" className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-surface">
        <Stat className="p-4 sm:p-5" label="Тренувань" value={data.weekWorkouts} hint="цього тижня" />
        <Stat className="p-4 sm:p-5" label="Тоннаж" value={formatNumber(data.weekVolumeKg / 1000, 1)} unit="т" hint="цього тижня" />
        <Stat className="p-4 sm:p-5" label="Рекорди" value={data.recordsCount} hint="усього" accent />
      </section>

      {data.lastLog && <LastWorkoutCard log={data.lastLog} />}

      {!activePlan && (
        <Link to="/plans" className={buttonClasses('outline', 'md', 'w-full')}>
          Обрати програму
        </Link>
      )}
    </div>
  )
}
