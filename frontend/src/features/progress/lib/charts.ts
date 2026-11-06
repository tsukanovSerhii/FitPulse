import { startOfWeek } from '@/shared/lib/date'
import type { WorkoutHistoryLog } from '../model/types'

const DAY = 24 * 60 * 60 * 1000

export interface WeekVolume {
  weekStart: Date
  volumeKg: number
  workouts: number
}

/** Training volume per calendar week for the last `weeks` weeks, oldest first, empty weeks included. */
export function weeklyVolume(history: WorkoutHistoryLog[], weeks = 12, now = new Date()): WeekVolume[] {
  const current = startOfWeek(now).getTime()
  const buckets = Array.from({ length: weeks }, (_, i) => ({
    weekStart: new Date(current - (weeks - 1 - i) * 7 * DAY),
    volumeKg: 0,
    workouts: 0,
  }))
  for (const log of history) {
    const index = weeks - 1 - Math.round((current - startOfWeek(new Date(log.date)).getTime()) / (7 * DAY))
    if (index < 0 || index >= weeks) continue
    buckets[index].volumeKg += log.totalVolumeKg
    buckets[index].workouts += 1
  }
  return buckets
}

export interface TrackedExercise {
  id: string
  name: string
  sessions: number
}

/** Exercises logged with a weight, most frequent first: the ones a weight chart makes sense for. */
export function trackedExercises(history: WorkoutHistoryLog[]): TrackedExercise[] {
  const byId = new Map<string, TrackedExercise>()
  for (const log of history) {
    for (const exercise of log.exercises) {
      if (!exercise.maxWeightKg) continue
      const entry = byId.get(exercise.exerciseId) ?? { id: exercise.exerciseId, name: exercise.exerciseName, sessions: 0 }
      entry.sessions += 1
      byId.set(exercise.exerciseId, entry)
    }
  }
  return [...byId.values()].sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name, 'uk'))
}

export interface WeightPoint {
  date: Date
  weightKg: number
  reps?: number
}

/** Heaviest set of one exercise in each session, oldest first. */
export function exerciseWeightHistory(history: WorkoutHistoryLog[], exerciseId: string): WeightPoint[] {
  return history
    .flatMap((log) => {
      const exercise = log.exercises.find((e) => e.exerciseId === exerciseId)
      return exercise?.maxWeightKg ? [{ date: new Date(log.date), weightKg: exercise.maxWeightKg, reps: exercise.repsAtMaxWeight }] : []
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}
