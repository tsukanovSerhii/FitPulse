import { startOfWeek } from '@/shared/lib/date'
import type { WorkoutHistoryLog } from '../model/types'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

// Steps by the calendar: a week across a clock change is an hour shorter or longer than WEEK_MS
const previousWeek = (weekStart: number) => startOfWeek(new Date(weekStart - 3 * DAY_MS)).getTime()

export interface WeeklyGoalStats {
  goal: number
  /** Workouts this week */
  done: number
  /** Weeks in a row that met the goal, this week included once it is met */
  streak: number
  best: number
}

/** Progress towards a number of workouts per week, and how many weeks in a row it was reached. */
export function weeklyGoalStats(history: WorkoutHistoryLog[], goal: number, now = new Date()): WeeklyGoalStats {
  const thisWeek = startOfWeek(now).getTime()
  const counts = new Map<number, number>()
  for (const log of history) {
    const week = startOfWeek(new Date(log.date)).getTime()
    counts.set(week, (counts.get(week) ?? 0) + 1)
  }
  const met = (week: number) => (counts.get(week) ?? 0) >= goal
  const done = counts.get(thisWeek) ?? 0

  // The week in progress never breaks a streak: it only adds to it once the goal is reached
  let streak = met(thisWeek) ? 1 : 0
  for (let week = previousWeek(thisWeek); met(week); week = previousWeek(week)) streak++

  let best = 0
  let run = 0
  const weeks = [...counts.keys()].sort((a, b) => a - b)
  for (let i = 0; i < weeks.length; i++) {
    const contiguous = i > 0 && Math.round((weeks[i] - weeks[i - 1]) / WEEK_MS) === 1
    run = met(weeks[i]) ? (contiguous && met(weeks[i - 1]) ? run + 1 : 1) : 0
    best = Math.max(best, run)
  }

  return { goal, done, streak, best: Math.max(best, streak) }
}
