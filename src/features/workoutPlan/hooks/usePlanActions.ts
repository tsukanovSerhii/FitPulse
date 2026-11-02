import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { confirmAction } from '@/components/ui'
import { startWorkout } from '@/features/workoutSession/model/workoutSessionSlice'
import {
  addExerciseToDay,
  deletePlanAsync,
  removeExerciseFromDay,
  savePlanAsync,
  setActivePlanAsync,
  updatePlanExercise,
} from '../model/workoutPlanSlice'
import { DAY_LABELS, type DayOfWeek, type PlanExercise, type WorkoutPlan } from '../model/types'

type ExerciseUpdates = Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds' | 'notes'>>

export function usePlanActions() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const plans = useAppSelector((state) => state.workoutPlan.plans)

  return {
    save: async (plan: WorkoutPlan) => {
      await dispatch(savePlanAsync(plan)).unwrap()
    },

    setActive: (planId: string) => dispatch(setActivePlanAsync(planId)),

    remove: async (planId: string) => {
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
    },

    startDay: (planId: string, day: DayOfWeek) => {
      const plan = plans.find((p) => p.id === planId)
      const exercises = plan?.schedule[day] ?? []
      if (!plan || exercises.length === 0) {
        toast.warning('У цьому дні ще немає вправ', { description: 'Додайте хоча б одну вправу перед початком.' })
        return
      }
      dispatch(startWorkout({ planId: plan.id, dayLabel: `${DAY_LABELS[day]} (${plan.name})`, exercises }))
      navigate('/workout')
    },

    addExercise: (planId: string, day: DayOfWeek, exercise: Omit<PlanExercise, 'id' | 'order'>) =>
      dispatch(addExerciseToDay({ planId, day, exercise })),

    removeExercise: (planId: string, day: DayOfWeek, exerciseId: string) =>
      dispatch(removeExerciseFromDay({ planId, day, exerciseId })),

    updateExercise: (planId: string, day: DayOfWeek, exerciseId: string, updates: ExerciseUpdates) =>
      dispatch(updatePlanExercise({ planId, day, exerciseId, updates })),
  }
}
