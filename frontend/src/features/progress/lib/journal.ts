import { startOfWeek } from '@/shared/lib/date'
import type { PersonalRecord, WorkoutHistoryLog } from '../model/types'

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const byDateDesc = (a: WorkoutHistoryLog, b: WorkoutHistoryLog) => b.date.localeCompare(a.date)

export interface MonthGroup {
  key: string
  month: Date
  logs: WorkoutHistoryLog[]
  totals: { workouts: number; volumeKg: number; seconds: number }
}

/** Journal entries grouped by calendar month, newest month and newest entry first. */
export function groupByMonth(history: WorkoutHistoryLog[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>()
  for (const log of [...history].sort(byDateDesc)) {
    const date = new Date(log.date)
    const key = monthKey(date)
    const group = groups.get(key) ?? {
      key,
      month: new Date(date.getFullYear(), date.getMonth(), 1),
      logs: [],
      totals: { workouts: 0, volumeKg: 0, seconds: 0 },
    }
    group.logs.push(log)
    group.totals.workouts += 1
    group.totals.volumeKg += log.totalVolumeKg
    group.totals.seconds += log.durationSeconds
    groups.set(key, group)
  }
  return [...groups.values()]
}

export interface CalendarDay {
  date: Date
  inMonth: boolean
  logs: WorkoutHistoryLog[]
}

const dayKey = (date: Date) => `${monthKey(date)}-${String(date.getDate()).padStart(2, '0')}`

/** Monday-first weeks covering `month` (0-based), with the workouts of each day. */
export function monthCalendar(year: number, month: number, history: WorkoutHistoryLog[]): CalendarDay[][] {
  const byDay = new Map<string, WorkoutHistoryLog[]>()
  for (const log of history) {
    const key = dayKey(new Date(log.date))
    byDay.set(key, [...(byDay.get(key) ?? []), log])
  }
  const first = new Date(year, month, 1)
  const cursor = startOfWeek(first)
  const weeks: CalendarDay[][] = []
  while (weeks.length === 0 || cursor.getMonth() === month) {
    const week: CalendarDay[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(cursor)
      week.push({ date, inMonth: date.getMonth() === month, logs: byDay.get(dayKey(date)) ?? [] })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

export interface JournalFilter {
  query: string
  plan: string
}

/** Entries matching a free-text query (exercise, day or plan name) and an optional plan. */
export function filterJournal(history: WorkoutHistoryLog[], { query, plan }: JournalFilter): WorkoutHistoryLog[] {
  const q = query.trim().toLowerCase()
  return history.filter((log) => {
    if (plan && log.planName !== plan) return false
    if (!q) return true
    return [log.planName, log.dayLabel ?? '', ...log.exercises.map((e) => e.exerciseName)].some((text) => text.toLowerCase().includes(q))
  })
}

/** Exercises of a session that set the personal record still standing. */
export function recordExerciseIds(log: WorkoutHistoryLog, records: Record<string, PersonalRecord>): Set<string> {
  return new Set(log.exercises.filter((e) => records[e.exerciseId]?.achievedAt === log.date).map((e) => e.exerciseId))
}
