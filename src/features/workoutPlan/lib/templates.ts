import { ALL_DAYS, type DayOfWeek, type PlanGoal, type PlanTemplate, type WorkoutPlan } from '../model/types'

export type DaysFilter = 'all' | '2-3' | '4-5' | '6+'

export interface TemplateFilters {
  days: DaysFilter
  goal: PlanGoal | 'all'
}

export const templateDays = (template: PlanTemplate): DayOfWeek[] =>
  ALL_DAYS.filter((day) => (template.schedule[day]?.length ?? 0) > 0)

const DAY_RANGES: Record<Exclude<DaysFilter, 'all'>, [number, number]> = {
  '2-3': [2, 3],
  '4-5': [4, 5],
  '6+': [6, 7],
}

export function filterTemplates(templates: PlanTemplate[], { days, goal }: TemplateFilters): PlanTemplate[] {
  return templates.filter((template) => {
    if (goal !== 'all' && template.goal !== goal) return false
    if (days === 'all') return true
    const count = templateDays(template).length
    const [min, max] = DAY_RANGES[days]
    return count >= min && count <= max
  })
}

/** A new user plan with its own ids, so editing it never touches the template. */
export function planFromTemplate(template: PlanTemplate, now = new Date()): WorkoutPlan {
  const stamp = now.getTime()
  const iso = now.toISOString()
  const schedule = Object.fromEntries(
    ALL_DAYS.map((day) => [
      day,
      (template.schedule[day] ?? []).map((exercise, i) => ({ ...exercise, id: `${day}-${i + 1}-${stamp}`, order: i + 1 })),
    ]),
  ) as WorkoutPlan['schedule']

  return {
    id: `plan-${stamp}`,
    templateId: template.id,
    name: template.name,
    description: template.description,
    createdAt: iso,
    updatedAt: iso,
    schedule,
  }
}
