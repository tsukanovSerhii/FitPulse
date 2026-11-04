import { ALL_DAYS, type DayOfWeek } from '../model/types'

type Schedule<T> = Partial<Record<DayOfWeek, T[]>>

/** Weekdays that have exercises, Monday first. */
export const trainingDaysOf = <T>(schedule: Schedule<T>): DayOfWeek[] =>
  ALL_DAYS.filter((day) => (schedule[day]?.length ?? 0) > 0)

/** Picked days in week order, so sessions always run Monday to Sunday. */
export const sortDays = (days: DayOfWeek[]): DayOfWeek[] => ALL_DAYS.filter((day) => days.includes(day))

/**
 * Puts the plan's sessions on the days the user trains, in order: the first session on the first
 * picked day, the second on the second and so on. Needs exactly one picked day per session.
 */
export function assignTrainingDays<T>(schedule: Schedule<T>, days: DayOfWeek[]): Record<DayOfWeek, T[]> {
  const sessions = trainingDaysOf(schedule).map((day) => schedule[day]!)
  const picked = sortDays(days)
  if (picked.length !== sessions.length) throw new Error(`Expected ${sessions.length} training days, got ${picked.length}`)
  const result = Object.fromEntries(ALL_DAYS.map((day) => [day, [] as T[]])) as Record<DayOfWeek, T[]>
  picked.forEach((day, i) => {
    result[day] = sessions[i]
  })
  return result
}
