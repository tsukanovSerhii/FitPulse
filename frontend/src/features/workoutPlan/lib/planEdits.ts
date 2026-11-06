import type { DayOfWeek, PlanExercise, WorkoutPlan } from '../model/types'

export type ExerciseUpdates = Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds' | 'notes'>>

export type PlanEdit =
  | { type: 'add'; day: DayOfWeek; exercise: PlanExercise }
  | { type: 'remove'; day: DayOfWeek; exerciseId: string }
  | { type: 'update'; day: DayOfWeek; exerciseId: string; updates: ExerciseUpdates }
  /** Joins the exercise with the next one into a superset, or splits them if already joined */
  | { type: 'link'; day: DayOfWeek; exerciseId: string; groupId: string }

/** A superset needs two exercises in a row: lone members lose their group. */
export function normalizeGroups(day: PlanExercise[]): PlanExercise[] {
  return day.map((exercise, i) => {
    if (!exercise.group) return exercise
    const joined = day[i - 1]?.group === exercise.group || day[i + 1]?.group === exercise.group
    if (joined) return exercise
    const { group: _drop, ...rest } = exercise
    return rest
  })
}

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
    case 'link': {
      const i = day.findIndex((e) => e.id === edit.exerciseId)
      const current = day[i]
      const next = day[i + 1]
      if (!current || !next) break
      if (current.group && current.group === next.group) {
        // Split: everything after this exercise in the same superset becomes its own group
        const tail = edit.groupId
        for (let j = i + 1; j < day.length && day[j].group === current.group; j++) day[j].group = tail
      } else {
        const group = current.group ?? next.group ?? edit.groupId
        const oldNext = next.group
        current.group = group
        for (let j = i + 1; j < day.length && (j === i + 1 || (oldNext && day[j].group === oldNext)); j++) day[j].group = group
      }
      break
    }
  }
  plan.schedule[edit.day] = normalizeGroups(plan.schedule[edit.day])
  plan.updatedAt = now.toISOString()
}
