import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus } from 'lucide-react'
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
import { DAY_LABELS } from '@/features/workoutPlan/model/types'
import { PlanCard } from '@/features/workoutPlan/components/PlanCard'
import { PlanEditorModal } from '@/features/workoutPlan/components/PlanEditorModal'
import { AddExerciseToDayModal } from '@/features/workoutPlan/components/AddExerciseToDayModal'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'

export const WorkoutPlansPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { plans, activePlanId, status } = useAppSelector((state) => state.workoutPlan)
  const allExercises = useAppSelector((state) => state.exercises.items)

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null)

  // Day editor state
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
    if (window.confirm('Ви дійсно бажаєте видалити цей тренувальний план?')) {
      await dispatch(deletePlanAsync(planId)).unwrap()
    }
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
      alert('У цьому дні ще немає вправ. Додайте хоча б одну вправу перед початком.')
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
    // Keep modal state updated with the refreshed plan
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

  // Get current plan for modal
  const activeModalPlan = dayEditorModal.plan
    ? plans.find((p) => p.id === dayEditorModal.plan?.id) || dayEditorModal.plan
    : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-purple-400" />
            Програми тренувань
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Плануйте тижневий графік, налаштовуйте підходи, повторення та цільову вагу
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreatePlan}
          icon={<Plus className="w-4 h-4" />}
        >
          Створити нову програму
        </Button>
      </div>

      {/* Plans List */}
      {status === 'loading' && plans.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
          Завантаження програм тренувань...
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title="Немає створених програм"
          description="Створіть свій перший тижневий план тренувань, щоб систематизувати свої заняття."
          action={
            <Button variant="primary" onClick={handleCreatePlan} icon={<Plus className="w-4 h-4" />}>
              Створити програму
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActive={plan.id === activePlanId}
              allExercises={allExercises}
              onSetActive={handleSetActivePlan}
              onEditDay={handleOpenDayEditor}
              onDelete={handleDeletePlan}
              onStartDayWorkout={handleStartDayWorkout}
            />
          ))}
        </div>
      )}

      {/* Plan Metadata Editor Modal */}
      <PlanEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePlan}
        initialPlan={editingPlan}
      />

      {/* Day Schedule Editor Modal */}
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
