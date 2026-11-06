import type { Exercise } from '@/features/exercises'
import { matchesSearch } from '@/shared/lib/search'
import { ALL_DAYS, type WorkoutPlan } from '../model/types'

/** Matches name, description or any scheduled exercise; the active plan always comes first. */
export function searchPlans(
  plans: WorkoutPlan[],
  exercises: (Pick<Exercise, 'id' | 'name'> & { aliases?: string })[],
  query: string,
  activePlanId: string | null,
) {
  const names = new Map(exercises.map((e) => [e.id, [e.name, e.aliases].filter(Boolean).join(' ')]))
  const matches = (plan: WorkoutPlan) =>
    !query.trim() ||
    matchesSearch(`${plan.name} ${plan.description ?? ''}`, query) ||
    ALL_DAYS.some((day) => plan.schedule[day]?.some((item) => matchesSearch(names.get(item.exerciseId) ?? '', query)))

  return plans.filter(matches).sort((a, b) => Number(b.id === activePlanId) - Number(a.id === activePlanId))
}
