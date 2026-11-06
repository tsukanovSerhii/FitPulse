import type { ExerciseSummary, WorkoutHistoryLog } from '../model/types'

/** Tonnage of one exercise: exact from its sets, estimated from the heaviest set for older logs. */
const volumeOf = (e: ExerciseSummary) =>
  e.sets ? e.sets.reduce((sum, s) => sum + s.reps * (s.weight ?? 0), 0) : (e.maxWeightKg ?? 0) * e.totalReps

/** Refreshes an exercise's totals from its sets. */
export function summarizeExercise(e: ExerciseSummary): ExerciseSummary {
  if (!e.sets) return e
  let maxWeight = 0
  let repsAtMax = 0
  for (const s of e.sets) {
    const w = s.weight ?? 0
    if (w > maxWeight || (w === maxWeight && s.reps > repsAtMax)) {
      maxWeight = w
      repsAtMax = s.reps
    }
  }
  return {
    ...e,
    setsCompleted: e.sets.length,
    totalReps: e.sets.reduce((sum, s) => sum + s.reps, 0),
    maxWeightKg: maxWeight > 0 ? maxWeight : undefined,
    repsAtMaxWeight: maxWeight > 0 ? repsAtMax : undefined,
  }
}

/**
 * Applies edits to a finished workout and keeps its totals honest. Tonnage moves by the change of
 * each exercise, so older logs without sets keep the part of their total that cannot be recomputed.
 */
export function applyLogEdit(original: WorkoutHistoryLog, edited: WorkoutHistoryLog): WorkoutHistoryLog {
  const exercises = edited.exercises.map(summarizeExercise).filter((e) => e.setsCompleted > 0)
  const before = new Map(original.exercises.map((e) => [e.exerciseId, volumeOf(e)]))
  const after = new Map(exercises.map((e) => [e.exerciseId, volumeOf(e)]))
  let delta = 0
  for (const [id, volume] of before) delta += (after.get(id) ?? 0) - volume
  for (const [id, volume] of after) if (!before.has(id)) delta += volume

  return {
    ...edited,
    exercises,
    totalSets: exercises.reduce((sum, e) => sum + e.setsCompleted, 0),
    totalReps: exercises.reduce((sum, e) => sum + e.totalReps, 0),
    totalVolumeKg: Math.max(0, Math.round(original.totalVolumeKg + delta)),
  }
}
