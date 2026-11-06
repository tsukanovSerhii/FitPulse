import type { Exercise } from '@/features/exercises/model'
import { plural } from '@/shared/lib/formatters'
import type { LastPerformance } from './strength'

export interface Suggestion {
  weight?: number
  reps: number
  /** Plain advice for the workout screen: "Спробуйте 82,5 кг × 8 — на 2,5 кг більше, ніж минулого разу" */
  text: string
  kind: 'weight' | 'reps' | 'repeat'
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step
const kg = (value: number) => `${String(value).replace('.', ',')} кг`
const repsWord = (count: number) => plural(count, ['повтор', 'повтори', 'повторів'])

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
 * - bodyweight (pull-ups, push-ups): add a rep, or finish every rep first.
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
    return done
      ? { reps: topReps + 1, text: `Спробуйте ${repsWord(topReps + 1)} у підході — на один більше, ніж минулого разу.`, kind: 'reps' }
      : { reps: target.reps, text: `Минулого разу не вийшло всіх повторів. Спробуйте зробити по ${target.reps} у кожному підході.`, kind: 'repeat' }
  }
  if (!done) {
    return {
      weight: previous.weightKg,
      reps: target.reps,
      text: `Залиште ${kg(previous.weightKg)} і доберіть усі ${target.reps} повторів у кожному підході.`,
      kind: 'repeat',
    }
  }

  const isolation = exercise.muscleGroups.length <= 1
  if (isolation && topReps < target.reps + 2) {
    return {
      weight: previous.weightKg,
      reps: topReps + 1,
      text: `Спробуйте ${kg(previous.weightKg)} × ${topReps + 1} — на один повтор більше, ніж минулого разу.`,
      kind: 'reps',
    }
  }
  const step = weightStep(exercise, previous.weightKg)
  const weight = roundTo(previous.weightKg + step, 0.5)
  return {
    weight,
    reps: target.reps,
    text: `Минулого разу ви зробили всі повтори. Спробуйте ${kg(weight)} × ${target.reps} — на ${kg(step)} більше.`,
    kind: 'weight',
  }
}

/** In a light week: about 60 % of last time and an easy target, with no push for progress. */
export function deloadSuggestion(previous: LastPerformance | null, target: { reps: number }): Suggestion {
  if (previous?.weightKg) {
    const weight = Math.max(2.5, roundTo(previous.weightKg * 0.6, 2.5))
    return { weight, reps: target.reps, text: `Легкий тиждень: ${kg(weight)} × ${target.reps}, приблизно 60 % від минулого разу. Без відмови.`, kind: 'repeat' }
  }
  return { reps: target.reps, text: 'Легкий тиждень: робіть підходи з запасом 3–4 повтори, без відмови.', kind: 'repeat' }
}
