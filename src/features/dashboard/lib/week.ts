import type { DayOfWeek } from '@/features/workoutPlan/model/types'

/** Дні тижня у порядку з понеділка (індекс відповідає зміщенню від понеділка). */
export const WEEK_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function dayKeyOf(date: Date): DayOfWeek {
  return WEEK_DAYS[(date.getDay() + 6) % 7]
}

export function startOfWeek(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((date.getDay() + 6) % 7))
  return start
}

/** Наступний після сьогодні день, у який заплановані вправи (з переходом на наступний тиждень). */
export function nextTrainingDay(today: DayOfWeek, isTrainingDay: (day: DayOfWeek) => boolean): DayOfWeek | null {
  const start = WEEK_DAYS.indexOf(today)
  for (let offset = 1; offset <= 7; offset++) {
    const day = WEEK_DAYS[(start + offset) % 7]
    if (isTrainingDay(day)) return day
  }
  return null
}
