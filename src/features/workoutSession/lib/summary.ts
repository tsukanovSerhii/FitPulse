import type { ExerciseSummary, WorkoutHistoryLog } from '@/features/progress/model/types'
import type { WorkoutSessionState } from '../model/types'

const KCAL_PER_MINUTE = 7

/** Перетворює стан сесії на запис журналу. */
export function buildWorkoutLog(
  session: Pick<WorkoutSessionState, 'exercises' | 'completedSets' | 'elapsedSeconds' | 'planId' | 'dayLabel'>,
  exerciseName: (exerciseId: string) => string,
  now = new Date(),
): WorkoutHistoryLog {
  let totalSets = 0
  let totalReps = 0
  let totalVolumeKg = 0
  const exercises: ExerciseSummary[] = []

  for (const planExercise of session.exercises) {
    const sets = session.completedSets[planExercise.id] || []
    if (sets.length === 0) continue

    let reps = 0
    let maxWeight = 0
    let repsAtMax = 0
    for (const set of sets) {
      const weight = set.weight || 0
      totalSets += 1
      totalReps += set.reps
      reps += set.reps
      totalVolumeKg += set.reps * weight
      if (weight > maxWeight || (weight === maxWeight && set.reps > repsAtMax)) {
        maxWeight = weight
        repsAtMax = set.reps
      }
    }

    exercises.push({
      exerciseId: planExercise.exerciseId,
      exerciseName: exerciseName(planExercise.exerciseId),
      setsCompleted: sets.length,
      totalReps: reps,
      maxWeightKg: maxWeight > 0 ? maxWeight : undefined,
      repsAtMaxWeight: maxWeight > 0 ? repsAtMax : undefined,
    })
  }

  const minutes = Math.max(1, Math.round(session.elapsedSeconds / 60))

  return {
    id: `workout-${now.getTime()}`,
    planId: session.planId,
    planName: session.dayLabel || 'Індивідуальне тренування',
    dayLabel: session.dayLabel,
    date: now.toISOString(),
    durationSeconds: session.elapsedSeconds,
    totalSets,
    totalReps,
    totalVolumeKg,
    caloriesBurned: minutes * KCAL_PER_MINUTE,
    exercises,
  }
}

/** «Понеділок (Push / Pull / Legs (3 дні))» → «Понеділок · Push / Pull / Legs» */
export function formatSessionTitle(dayLabel: string | null) {
  if (!dayLabel) return 'Тренування'
  const match = dayLabel.match(/^([^(]+)\s*\((.+)\)\s*$/)
  if (!match) return dayLabel
  return `${match[1].trim()} · ${match[2].replace(/\s*\([^)]*\)/g, '').trim()}`
}
