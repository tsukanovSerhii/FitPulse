import { useMemo, useState } from 'react'
import { Play, Zap } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { Button, LoadingRegion, PageHeader, Select, Skeleton } from '@/shared/ui'
import { dayKeyOf } from '@/features/dashboard/lib/week'
import { ALL_DAYS, DAY_LABELS, type PlanExercise } from '@/features/workoutPlan/model/types'
import { cn } from '@/shared/lib/cn'
import { startWorkout } from '../model/workoutSessionSlice'

const QUICK_WORKOUT_SIZE = 4

export function WorkoutLauncher() {
  const dispatch = useAppDispatch()
  const { plans, activePlanId, status } = useAppSelector((state) => state.workoutPlan)
  const exercises = useAppSelector((state) => state.exercises.items)
  const [pickedPlanId, setPickedPlanId] = useState<string | null>(null)
  const [today] = useState(() => dayKeyOf(new Date()))

  const planId = pickedPlanId ?? activePlanId ?? plans[0]?.id
  const plan = plans.find((p) => p.id === planId)
  const exerciseNames = useMemo(() => new Map(exercises.map((e) => [e.id, e.name])), [exercises])

  const start = (dayLabel: string, items: PlanExercise[], fromPlanId: string | null) =>
    dispatch(startWorkout({ planId: fromPlanId, dayLabel, exercises: items }))

  const startQuick = () =>
    start(
      'Експрес-тренування',
      exercises.slice(0, QUICK_WORKOUT_SIZE).map((ex, i) => ({
        id: `quick-${i}`,
        exerciseId: ex.id,
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        restSeconds: ex.defaultRestSeconds,
        order: i + 1,
      })),
      null,
    )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader compact title="Тренування" description="Оберіть день програми або швидкий старт" />

      {plans.length > 1 && (
        <Select
          label="Програма"
          value={planId}
          onChange={(e) => setPickedPlanId(e.target.value)}
          options={plans.map((p) => ({ value: p.id, label: p.name }))}
        />
      )}

      {!plan && (status === 'idle' || status === 'loading') && (
        <LoadingRegion label="Завантаження програми" className="divide-y divide-line rounded-lg border border-line bg-surface">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
              <Skeleton className="size-11 rounded-full" />
            </div>
          ))}
        </LoadingRegion>
      )}

      {plan && (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {ALL_DAYS.map((day) => {
            const items = plan.schedule[day] || []
            const isToday = day === today
            if (items.length === 0) return null
            return (
              <li key={day}>
                <button
                  type="button"
                  onClick={() => start(`${DAY_LABELS[day]} (${plan.name})`, items, plan.id)}
                  className="flex w-full cursor-pointer items-center gap-4 p-4 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-fg">{DAY_LABELS[day]}</span>
                      {isToday && <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Сьогодні</span>}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-fg-subtle">
                      {items.map((item) => exerciseNames.get(item.exerciseId) || 'Вправа').join(', ')}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-full',
                      isToday ? 'bg-accent text-on-accent' : 'border border-line-strong text-fg',
                    )}
                    aria-hidden="true"
                  >
                    <Play className="size-4 translate-x-px fill-current" />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-line-strong p-4">
        <div>
          <p className="flex items-center gap-2 font-semibold text-fg">
            <Zap className="size-4 text-accent" aria-hidden="true" />
            Швидкий старт
          </p>
          <p className="mt-0.5 text-sm text-fg-subtle">{QUICK_WORKOUT_SIZE} базові вправи без розкладу</p>
        </div>
        <Button variant="outline" size="sm" onClick={startQuick} disabled={exercises.length === 0}>
          Почати
        </Button>
      </div>
    </div>
  )
}
