import type { Exercise } from '@/features/exercises/model'
import type { WorkoutHistoryLog } from '@/features/progress'
import type { PlanExercise } from '@/features/workoutPlan/model'

/**
 * The exercises of a finished workout as targets for doing it again: as many sets as were done,
 * with the reps and weight of the heaviest set.
 */
export function exercisesFromLog(log: WorkoutHistoryLog, catalog: Pick<Exercise, 'id' | 'defaultRestSeconds'>[], now = Date.now()): PlanExercise[] {
  const rest = new Map(catalog.map((e) => [e.id, e.defaultRestSeconds]))
  return log.exercises.map((e, i) => {
    const top = e.sets?.reduce((best, s) => ((s.weight ?? 0) > (best.weight ?? 0) ? s : best), e.sets[e.sets.length - 1])
    const reps = top?.reps ?? e.repsAtMaxWeight ?? Math.max(1, Math.round(e.totalReps / Math.max(e.setsCompleted, 1)))
    const weight = top?.weight ?? e.maxWeightKg
    return {
      id: `repeat-${i + 1}-${now}`,
      exerciseId: e.exerciseId,
      sets: Math.max(1, e.setsCompleted),
      reps,
      restSeconds: rest.get(e.exerciseId) ?? 90,
      order: i + 1,
      ...(weight ? { weight } : {}),
    }
  })
}

/** The most recent workout that can be repeated: one with at least one exercise. */
export const latestRepeatable = (history: WorkoutHistoryLog[]) =>
  [...history].filter((log) => log.exercises.length > 0).sort((a, b) => b.date.localeCompare(a.date))[0]
