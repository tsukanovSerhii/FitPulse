import { toast } from 'sonner'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus, Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  fetchPlans,
  savePlanAsync,
  deletePlanAsync,
  setActivePlanAsync,
  addExerciseToDay,
  removeExerciseFromDay,
  updatePlanExercise,
} from '@/features/workoutPlan/model/workoutPlanSlice'
import { fetchExercises } from '@/features/exercises/model/exercisesSlice'
import { startWorkout } from '@/features/workoutSession/model/workoutSessionSlice'
import type { WorkoutPlan, DayOfWeek, PlanExercise } from '@/features/workoutPlan/model/types'
import { ALL_DAYS, DAY_LABELS } from '@/features/workoutPlan/model/types'
import { PlanCard } from '@/features/workoutPlan/components/PlanCard'
import { PlanEditorModal } from '@/features/workoutPlan/components/PlanEditorModal'
import { AddExerciseToDayModal } from '@/features/workoutPlan/components/AddExerciseToDayModal'
import { Button, IconButton, PageHeader, confirmAction } from '@/components/ui'
import { EmptyState } from '@/components/ui'
import { SEO } from '@/components/common/SEO'

export const WorkoutPlansPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { plans, activePlanId, status } = useAppSelector((state) => state.workoutPlan)
  const allExercises = useAppSelector((state) => state.exercises.items)

  const [query, setQuery] = useState('')
  // undefined: nothing toggled yet, so the active plan is shown expanded
  const [expandedId, setExpandedId] = useState<string | null | undefined>(undefined)
  const openPlanId = expandedId === undefined ? activePlanId : expandedId
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null)

  const [dayEditorModal, setDayEditorModal] = useState<{
    isOpen: boolean
    plan: WorkoutPlan | null
    day: DayOfWeek | null
  }>({
    isOpen: false,
    plan: null,
    day: null,
  })

  useEffect(() => {
    
    if (plans.length === 0) {
      dispatch(fetchPlans())
    }
    if (allExercises.length === 0) {
      dispatch(fetchExercises())
    }
  }, [dispatch, plans.length, allExercises.length])

  const handleCreatePlan = () => {
    setEditingPlan(null)
    setIsEditorOpen(true)
  }

  const handleSavePlan = async (plan: WorkoutPlan) => {
    await dispatch(savePlanAsync(plan)).unwrap()
  }

  const handleDeletePlan = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    const confirmed = await confirmAction({
      title: 'Видалити програму?',
      description: plan ? `«${plan.name}» буде видалено без можливості відновлення.` : undefined,
      confirmLabel: 'Видалити',
      destructive: true,
    })
    if (!confirmed) return
    await dispatch(deletePlanAsync(planId)).unwrap()
    toast.success('Програму видалено')
  }

  const handleSetActivePlan = (planId: string) => {
    dispatch(setActivePlanAsync(planId))
  }

  const handleOpenDayEditor = (planId: string, day: DayOfWeek) => {
    const plan = plans.find((p) => p.id === planId)
    if (plan) {
      setDayEditorModal({
        isOpen: true,
        plan,
        day,
      })
    }
  }

  const handleStartDayWorkout = (planId: string, day: DayOfWeek) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return
    const exercises = plan.schedule[day] || []
    if (exercises.length === 0) {
      toast.warning('У цьому дні ще немає вправ', { description: 'Додайте хоча б одну вправу перед початком.' })
      return
    }

    dispatch(
      startWorkout({
        planId: plan.id,
        dayLabel: `${DAY_LABELS[day]} (${plan.name})`,
        exercises,
      }),
    )
    navigate('/workout')
  }

  const handleAddExerciseToDay = (
    planId: string,
    day: DayOfWeek,
    exercise: Omit<PlanExercise, 'id' | 'order'>,
  ) => {
    dispatch(addExerciseToDay({ planId, day, exercise }))
    setTimeout(() => {
      const updatedPlan = plans.find((p) => p.id === planId)
      if (updatedPlan) {
        setDayEditorModal((prev) => ({ ...prev, plan: updatedPlan }))
      }
    }, 50)
  }

  const handleRemoveExerciseFromDay = (planId: string, day: DayOfWeek, exerciseId: string) => {
    dispatch(removeExerciseFromDay({ planId, day, exerciseId }))
    setTimeout(() => {
      const updatedPlan = plans.find((p) => p.id === planId)
      if (updatedPlan) {
        setDayEditorModal((prev) => ({ ...prev, plan: updatedPlan }))
      }
    }, 50)
  }

  const handleUpdateExercise = (
    planId: string,
    day: DayOfWeek,
    exerciseId: string,
    updates: Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds' | 'notes'>>,
  ) => {
    dispatch(updatePlanExercise({ planId, day, exerciseId, updates }))
  }

  const visiblePlans = useMemo(() => {
    const names = new Map(allExercises.map((e) => [e.id, e.name.toLowerCase()]))
    const q = query.trim().toLowerCase()
    const matches = (plan: WorkoutPlan) =>
      !q ||
      plan.name.toLowerCase().includes(q) ||
      plan.description?.toLowerCase().includes(q) ||
      ALL_DAYS.some((day) => plan.schedule[day]?.some((pEx) => names.get(pEx.exerciseId)?.includes(q)))
    return plans.filter(matches).sort((a, b) => Number(b.id === activePlanId) - Number(a.id === activePlanId))
  }, [plans, allExercises, query, activePlanId])

  const activeModalPlan = dayEditorModal.plan
    ? plans.find((p) => p.id === dayEditorModal.plan?.id) || dayEditorModal.plan
    : null

  return (
    <div className="space-y-4">
      <SEO title="Програми тренувань" description="Тижневі спліти: Push/Pull/Legs, Full Body. Підходи, повторення та дні відпочинку." />
      <PageHeader
        compact
        title="Програми"
        description="Тижневі спліти та розклад"
        actions={
          <>
            <IconButton label="Нова програма" icon={<Plus />} onClick={handleCreatePlan} className="border border-line sm:hidden" />
            <Button className="hidden sm:inline-flex" onClick={handleCreatePlan} icon={<Plus />}>
              Нова програма
            </Button>
          </>
        }
      />

      {plans.length > 0 && (
        <label className="relative block">
          <span className="sr-only">Пошук програми</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за назвою або вправою"
            className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
          />
        </label>
      )}

      {status === 'loading' && plans.length === 0 ? (
        <p className="py-16 text-center text-sm text-fg-muted">Завантаження програм...</p>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<Calendar />}
          title="Програм ще немає"
          description="Створіть тижневий план, щоб систематизувати тренування."
          action={
            <Button onClick={handleCreatePlan} icon={<Plus />}>
              Створити програму
            </Button>
          }
        />
      ) : visiblePlans.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="Нічого не знайдено"
          description={`Немає програм за запитом «${query}».`}
          action={
            <Button variant="outline" size="sm" onClick={() => setQuery('')}>
              Очистити пошук
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {visiblePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActive={plan.id === activePlanId}
              expanded={openPlanId === plan.id}
              onToggle={() => setExpandedId(openPlanId === plan.id ? null : plan.id)}
              allExercises={allExercises}
              onSetActive={handleSetActivePlan}
              onEditDay={handleOpenDayEditor}
              onDelete={handleDeletePlan}
              onStartDayWorkout={handleStartDayWorkout}
            />
          ))}
        </div>
      )}

      <PlanEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePlan}
        initialPlan={editingPlan}
      />

      <AddExerciseToDayModal
        isOpen={dayEditorModal.isOpen}
        onClose={() => setDayEditorModal({ isOpen: false, plan: null, day: null })}
        plan={activeModalPlan}
        day={dayEditorModal.day}
        allExercises={allExercises}
        onAddExercise={handleAddExerciseToDay}
        onRemoveExercise={handleRemoveExerciseFromDay}
        onUpdateExercise={handleUpdateExercise}
      />
    </div>
  )
}
