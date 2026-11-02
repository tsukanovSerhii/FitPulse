import { useMemo, useState } from 'react'
import { useAppSelector } from '@/app/store/hooks'
import type { DayOfWeek } from '@/features/workoutPlan/model/types'
import { dayKeyOf, nextTrainingDay, startOfWeek, WEEK_DAYS } from './week'

export function useDashboardData() {
  const plansState = useAppSelector((state) => state.workoutPlan)
  const exercises = useAppSelector((state) => state.exercises.items)
  const history = useAppSelector((state) => state.progress.history)
  const personalRecords = useAppSelector((state) => state.progress.personalRecords)
  const session = useAppSelector((state) => state.workoutSession)

  const [now] = useState(() => new Date())
  const today = dayKeyOf(now)

  const activePlan = plansState.plans.find((p) => p.id === plansState.activePlanId) ?? plansState.plans[0]
  const isPlanned = (day: DayOfWeek) => (activePlan?.schedule[day]?.length ?? 0) > 0
  const todayExercises = activePlan?.schedule[today] ?? []

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])

  const weekStart = startOfWeek(now).getTime()
  const weekLogs = useMemo(() => history.filter((log) => new Date(log.date).getTime() >= weekStart), [history, weekStart])
  const lastLog = useMemo(
    () => [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
    [history],
  )

  return {
    now,
    today,
    session,
    activePlan,
    todayExercises,
    exerciseMap,
    isPlanned,
    nextDay: activePlan ? nextTrainingDay(today, isPlanned) : null,
    doneDays: new Set<DayOfWeek>(weekLogs.map((log) => dayKeyOf(new Date(log.date)))),
    plannedThisWeek: WEEK_DAYS.filter(isPlanned).length,
    weekWorkouts: weekLogs.length,
    weekVolumeKg: weekLogs.reduce((sum, log) => sum + log.totalVolumeKg, 0),
    recordsCount: Object.keys(personalRecords).length,
    lastLog,
  }
}
