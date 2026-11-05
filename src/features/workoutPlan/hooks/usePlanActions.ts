import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { confirmAction } from '@/shared/ui'
import {
  addExerciseToDay,
  deletePlanAsync,
  removeExerciseFromDay,
  savePlanAsync,
  setActivePlanAsync,
  toggleSuperset,
  updatePlanExercise,
} from '../model/workoutPlanSlice'
import type { DayOfWeek, PlanExercise, PlanTemplate, WorkoutPlan } from '../model/types'
import { planFromTemplate } from '../lib/templates'
import { assignTrainingDays } from '../lib/trainingDays'
import { deloadUntilFrom, manualDeload } from '../lib/cycle'

type ExerciseUpdates = Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds' | 'notes'>>

export function usePlanActions() {
  const dispatch = useAppDispatch()
  const plans = useAppSelector((state) => state.workoutPlan.plans)

  return {
    save: async (plan: WorkoutPlan) => {
      await dispatch(savePlanAsync(plan)).unwrap()
    },

    setActive: (planId: string) => dispatch(setActivePlanAsync(planId)),

    /** Switches a hand-made light week on for seven days, or off again. */
    toggleDeload: async (plan: WorkoutPlan) => {
      const on = !manualDeload(plan)
      const { deloadUntil: _drop, ...rest } = plan
      await dispatch(savePlanAsync(on ? { ...rest, deloadUntil: deloadUntilFrom() } : rest)).unwrap()
      toast.success(on ? 'Легкий тиждень увімкнено на 7 днів' : 'Легкий тиждень вимкнено')
    },

    /** Moves the plan's sessions onto the weekdays the user trains. */
    setTrainingDays: async (plan: WorkoutPlan, days: DayOfWeek[]) => {
      await dispatch(savePlanAsync({ ...plan, schedule: assignTrainingDays(plan.schedule, days) })).unwrap()
      toast.success('Дні тренувань оновлено')
    },

    addFromTemplate: async (template: PlanTemplate, days?: DayOfWeek[]) => {
      const plan = await dispatch(savePlanAsync(planFromTemplate(template, { days }))).unwrap()
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

    toggleSuperset: (planId: string, day: DayOfWeek, exerciseId: string) => dispatch(toggleSuperset({ planId, day, exerciseId })),

    updateExercise: (planId: string, day: DayOfWeek, exerciseId: string, updates: ExerciseUpdates) =>
      dispatch(updatePlanExercise({ planId, day, exerciseId, updates })),
  }
}
