import type { Exercise } from '@/features/exercises/model'
import type { LastPerformance } from './strength'

export interface Suggestion {
  weight?: number
  reps: number
  /** Short note for the workout screen: "+2,5 кг" */
  change: string
  kind: 'weight' | 'reps' | 'repeat'
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step
const kg = (value: number) => `${String(value).replace('.', ',')} кг`

/** Smallest jump the equipment allows; heavy lower-body and back lifts move faster. */
export function weightStep(exercise: Pick<Exercise, 'equipment' | 'primaryMuscle'>, weight: number): number {
  if (exercise.equipment === 'dumbbell' || exercise.equipment === 'kettlebell') return 2
  const big = ['legs', 'glutes', 'back'].includes(exercise.primaryMuscle) && ['barbell', 'smith', 'machine'].includes(exercise.equipment)
  return big && weight >= 60 ? 5 : 2.5
}

/**
 * Double progression from the last session of the exercise:
 * - target missed: repeat the weight and finish every rep;
 * - compound lift done: add the smallest weight step;
 * - isolation done: add a rep until two above the target, then add weight and start over;
 * - bodyweight done: add a rep.
 */
export function suggestNext(
  previous: LastPerformance | null,
  target: { sets: number; reps: number },
  exercise: Pick<Exercise, 'equipment' | 'primaryMuscle' | 'muscleGroups'>,
): Suggestion | null {
  if (!previous) return null
  const topReps = previous.reps ?? Math.round(previous.totalReps / Math.max(previous.sets, 1))
  const done = previous.sets >= target.sets && previous.totalReps >= target.sets * target.reps

  if (!previous.weightKg) {
    return done ? { reps: topReps + 1, change: '+1 повтор', kind: 'reps' } : { reps: target.reps, change: 'доберіть усі повтори', kind: 'repeat' }
  }
  if (!done) return { weight: previous.weightKg, reps: target.reps, change: 'та сама вага', kind: 'repeat' }

  const isolation = exercise.muscleGroups.length <= 1
  if (isolation && topReps < target.reps + 2) {
    return { weight: previous.weightKg, reps: topReps + 1, change: '+1 повтор', kind: 'reps' }
  }
  const step = weightStep(exercise, previous.weightKg)
  return { weight: roundTo(previous.weightKg + step, 0.5), reps: target.reps, change: `+${kg(step)}`, kind: 'weight' }
}
