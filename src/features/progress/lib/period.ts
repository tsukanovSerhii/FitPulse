import { startOfWeek } from '@/shared/lib/date'
import type { WorkoutHistoryLog } from '../model/types'

export type Period = 'week' | 'month'

export interface PeriodTotals {
  workouts: number
  volumeKg: number
  seconds: number
}

export interface PeriodSummary {
  current: PeriodTotals
  previous: PeriodTotals
  /** Exercises whose best weight in this period beat everything before it */
  records: number
  /** The exercise whose best weight grew the most against the previous period */
  topGain: { exerciseId: string; name: string; fromKg: number; toKg: number } | null
}

function bounds(period: Period, now: Date) {
  if (period === 'week') {
    const start = startOfWeek(now)
    const prev = startOfWeek(new Date(start.getTime() - 3 * 24 * 3600 * 1000))
    return { start, prev }
  }
  return { start: new Date(now.getFullYear(), now.getMonth(), 1), prev: new Date(now.getFullYear(), now.getMonth() - 1, 1) }
}

const totals = (logs: WorkoutHistoryLog[]): PeriodTotals => ({
  workouts: logs.length,
  volumeKg: logs.reduce((s, l) => s + l.totalVolumeKg, 0),
  seconds: logs.reduce((s, l) => s + l.durationSeconds, 0),
})

/** Best weight per exercise across some logs. */
function bests(logs: WorkoutHistoryLog[]) {
  const map = new Map<string, { name: string; kg: number }>()
  for (const log of logs) {
    for (const e of log.exercises) {
      if (e.maxWeightKg && e.maxWeightKg > (map.get(e.exerciseId)?.kg ?? 0)) map.set(e.exerciseId, { name: e.exerciseName, kg: e.maxWeightKg })
    }
  }
  return map
}

/** This week or month against the one before: workouts, tonnage, time, new records and the biggest gain. */
export function periodSummary(history: WorkoutHistoryLog[], period: Period, now = new Date()): PeriodSummary {
  const { start, prev } = bounds(period, now)
  const inCurrent = history.filter((l) => new Date(l.date) >= start && new Date(l.date) <= now)
  const inPrevious = history.filter((l) => new Date(l.date) >= prev && new Date(l.date) < start)
  const before = bests(history.filter((l) => new Date(l.date) < start))
  const current = bests(inCurrent)
  const previous = bests(inPrevious)

  let records = 0
  let topGain: PeriodSummary['topGain'] = null
  for (const [id, best] of current) {
    if (best.kg > (before.get(id)?.kg ?? 0) && before.has(id)) records++
    const from = previous.get(id)?.kg
    if (from && best.kg > from && (!topGain || best.kg - from > topGain.toKg - topGain.fromKg)) {
      topGain = { exerciseId: id, name: best.name, fromKg: from, toKg: best.kg }
    }
  }
  return { current: totals(inCurrent), previous: totals(inPrevious), records, topGain }
}

/** Change against the previous period in percent, or null when there is nothing to compare with. */
export const percentChange = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 100) : null)
