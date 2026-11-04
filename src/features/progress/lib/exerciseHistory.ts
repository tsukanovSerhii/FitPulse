import { estimateOneRepMax } from '@/shared/lib/oneRepMax'
import type { LoggedSet, WorkoutHistoryLog } from '../model/types'

export interface ExerciseSession {
  logId: string
  date: string
  sets: number
  totalReps: number
  maxWeightKg?: number
  repsAtMaxWeight?: number
  oneRepMax: number | null
  loggedSets?: LoggedSet[]
}

export interface ExerciseStats {
  sessions: number
  bestWeight?: { weightKg: number; reps?: number; date: string }
  bestOneRepMax?: { value: number; date: string }
  lastDate?: string
}

/** Every session with the exercise, newest first, within the last `months` months (all when omitted). */
export function exerciseSessions(
  history: WorkoutHistoryLog[],
  exerciseId: string,
  { months, now = new Date() }: { months?: number; now?: Date } = {},
): ExerciseSession[] {
  const since = months ? new Date(now.getFullYear(), now.getMonth() - months, now.getDate()).toISOString() : ''
  return history
    .filter((log) => log.date >= since)
    .flatMap((log) => {
      const exercise = log.exercises.find((e) => e.exerciseId === exerciseId)
      if (!exercise) return []
      const reps = exercise.repsAtMaxWeight ?? Math.round(exercise.totalReps / Math.max(exercise.setsCompleted, 1))
      return [
        {
          logId: log.id,
          date: log.date,
          sets: exercise.setsCompleted,
          totalReps: exercise.totalReps,
          maxWeightKg: exercise.maxWeightKg,
          repsAtMaxWeight: exercise.repsAtMaxWeight,
          oneRepMax: exercise.maxWeightKg ? estimateOneRepMax(exercise.maxWeightKg, reps) : null,
          loggedSets: exercise.sets,
        },
      ]
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function exerciseStats(sessions: ExerciseSession[]): ExerciseStats {
  const stats: ExerciseStats = { sessions: sessions.length, lastDate: sessions[0]?.date }
  for (const s of sessions) {
    if (s.maxWeightKg && (!stats.bestWeight || s.maxWeightKg > stats.bestWeight.weightKg)) {
      stats.bestWeight = { weightKg: s.maxWeightKg, reps: s.repsAtMaxWeight, date: s.date }
    }
    if (s.oneRepMax && (!stats.bestOneRepMax || s.oneRepMax > stats.bestOneRepMax.value)) {
      stats.bestOneRepMax = { value: s.oneRepMax, date: s.date }
    }
  }
  return stats
}

/** Name of the exercise as last logged, for pages that open before the catalog loads. */
export const loggedName = (history: WorkoutHistoryLog[], exerciseId: string) =>
  history.flatMap((log) => log.exercises).find((e) => e.exerciseId === exerciseId)?.exerciseName
