import type { DayOfWeek, PlanExercise, WorkoutPlan } from '../model/types'

export type ExerciseUpdates = Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds' | 'notes'>>

export type PlanEdit =
  | { type: 'add'; day: DayOfWeek; exercise: PlanExercise }
  | { type: 'remove'; day: DayOfWeek; exerciseId: string }
  | { type: 'update'; day: DayOfWeek; exerciseId: string; updates: ExerciseUpdates }

/** Applies one edit to a plan in place. Safe on an Immer draft, so each edit lands on the latest state. */
export function applyPlanEdit(plan: WorkoutPlan, edit: PlanEdit, now = new Date()): void {
  const day = (plan.schedule[edit.day] ??= [])
  switch (edit.type) {
    case 'add':
      day.push({ ...edit.exercise, order: day.length + 1 })
      break
    case 'remove':
      plan.schedule[edit.day] = day.filter((e) => e.id !== edit.exerciseId).map((e, i) => ({ ...e, order: i + 1 }))
      break
    case 'update': {
      const exercise = day.find((e) => e.id === edit.exerciseId)
      if (exercise) Object.assign(exercise, edit.updates)
      break
    }
  }
  plan.updatedAt = now.toISOString()
}
