import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { confirmAction } from '@/shared/ui'
import {
  addExerciseToDay,
  deletePlanAsync,
  removeExerciseFromDay,
  savePlanAsync,
  setActivePlanAsync,
  updatePlanExercise,
} from '../model/workoutPlanSlice'
import type { DayOfWeek, PlanExercise, PlanTemplate, WorkoutPlan } from '../model/types'
import { planFromTemplate } from '../lib/templates'

type ExerciseUpdates = Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds' | 'notes'>>

export function usePlanActions() {
  const dispatch = useAppDispatch()
  const plans = useAppSelector((state) => state.workoutPlan.plans)

  return {
    save: async (plan: WorkoutPlan) => {
      await dispatch(savePlanAsync(plan)).unwrap()
    },

    setActive: (planId: string) => dispatch(setActivePlanAsync(planId)),

    addFromTemplate: async (template: PlanTemplate) => {
      const plan = await dispatch(savePlanAsync(planFromTemplate(template))).unwrap()
      toast.success(`Програму «${plan.name}» додано`, {
        action: { label: 'Зробити активною', onClick: () => dispatch(setActivePlanAsync(plan.id)) },
      })
      return plan
    },

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

    addExercise: (planId: string, day: DayOfWeek, exercise: Omit<PlanExercise, 'id' | 'order'>) =>
      dispatch(addExerciseToDay({ planId, day, exercise })),

    removeExercise: (planId: string, day: DayOfWeek, exerciseId: string) =>
      dispatch(removeExerciseFromDay({ planId, day, exerciseId })),

    updateExercise: (planId: string, day: DayOfWeek, exerciseId: string, updates: ExerciseUpdates) =>
      dispatch(updatePlanExercise({ planId, day, exerciseId, updates })),
  }
}
