import { assignTrainingDays } from './trainingDays'
import { ALL_DAYS, type DayOfWeek, type PlanGoal, type PlanTemplate, type WorkoutPlan } from '../model/types'

export type DaysFilter = 'all' | '2-3' | '4-5' | '6+'

export interface TemplateFilters {
  days: DaysFilter
  goal: PlanGoal | 'all'
  place?: 'all' | 'gym' | 'home'
}

export const templateDays = (template: PlanTemplate): DayOfWeek[] =>
  ALL_DAYS.filter((day) => (template.schedule[day]?.length ?? 0) > 0)

const DAY_RANGES: Record<Exclude<DaysFilter, 'all'>, [number, number]> = {
  '2-3': [2, 3],
  '4-5': [4, 5],
  '6+': [6, 7],
}

export function filterTemplates(templates: PlanTemplate[], { days, goal, place = 'all' }: TemplateFilters): PlanTemplate[] {
  return templates.filter((template) => {
    if (goal !== 'all' && template.goal !== goal) return false
    if (place !== 'all' && Boolean(template.home) !== (place === 'home')) return false
    if (days === 'all') return true
    const count = templateDays(template).length
    const [min, max] = DAY_RANGES[days]
    return count >= min && count <= max
  })
}

/**
 * A new user plan with its own ids, so editing it never touches the template.
 * With `days`, the sessions go on the weekdays the user trains instead of the template's own.
 */
export function planFromTemplate(template: PlanTemplate, { days, now = new Date() }: { days?: DayOfWeek[]; now?: Date } = {}): WorkoutPlan {
  const stamp = now.getTime()
  const iso = now.toISOString()
  const week = days ? assignTrainingDays(template.schedule, days) : template.schedule
  const schedule = Object.fromEntries(
    ALL_DAYS.map((day) => [
      day,
      (week[day] ?? []).map((exercise, i) => ({ ...exercise, id: `${day}-${i + 1}-${stamp}`, order: i + 1 })),
    ]),
  ) as WorkoutPlan['schedule']

  return {
    id: `plan-${stamp}`,
    templateId: template.id,
    name: template.name,
    description: template.description,
    ...(template.cycle && { cycle: { startDate: iso, phases: template.cycle } }),
    createdAt: iso,
    updatedAt: iso,
    schedule,
  }
}
