import type { Exercise } from '@/features/exercises'
import { ALL_DAYS, type WorkoutPlan } from '../model/types'

/** Matches name, description or any scheduled exercise; the active plan always comes first. */
export function searchPlans(plans: WorkoutPlan[], exercises: Pick<Exercise, 'id' | 'name'>[], query: string, activePlanId: string | null) {
  const names = new Map(exercises.map((e) => [e.id, e.name.toLowerCase()]))
  const q = query.trim().toLowerCase()
  const matches = (plan: WorkoutPlan) =>
    !q ||
    plan.name.toLowerCase().includes(q) ||
    Boolean(plan.description?.toLowerCase().includes(q)) ||
    ALL_DAYS.some((day) => plan.schedule[day]?.some((item) => names.get(item.exerciseId)?.includes(q)))

  return plans.filter(matches).sort((a, b) => Number(b.id === activePlanId) - Number(a.id === activePlanId))
}
