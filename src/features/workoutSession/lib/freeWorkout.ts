import type { Exercise, MuscleGroup } from '@/features/exercises/model'
import type { WorkoutHistoryLog } from '@/features/progress'
import { ALL_DAYS, type DayOfWeek, type PlanExercise, type WorkoutPlan } from '@/features/workoutPlan/model'
import type { WorkoutSessionState } from '../model/types'
import { lastPerformance } from './strength'

export const FREE_WORKOUT_LABEL = 'Вільне тренування'

export type PickerGroup = 'all' | 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs' | 'cardio'

const GROUP_MUSCLES: Record<Exclude<PickerGroup, 'all'>, MuscleGroup[]> = {
  chest: ['chest'],
  back: ['back'],
  legs: ['legs', 'glutes', 'calves'],
  shoulders: ['shoulders'],
  arms: ['biceps', 'triceps'],
  abs: ['abs'],
  cardio: ['cardio'],
}

/** Exercises for the picker: filtered by name and primary muscle, recently done ones first. */
export function pickerResults(exercises: Exercise[], query: string, group: PickerGroup, recentIds: string[] = []): Exercise[] {
  const q = query.trim().toLowerCase()
  const rank = new Map(recentIds.map((id, i) => [id, i]))
  return exercises
    .filter((e) => (group === 'all' || GROUP_MUSCLES[group].includes(e.primaryMuscle)) && (!q || e.name.toLowerCase().includes(q)))
    .sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity))
}

/** Exercise ids from the most recent workouts, newest first, without repeats. */
export function recentExerciseIds(history: WorkoutHistoryLog[], limit = 8): string[] {
  const ids: string[] = []
  for (const log of [...history].sort((a, b) => b.date.localeCompare(a.date))) {
    for (const e of log.exercises) if (!ids.includes(e.exerciseId)) ids.push(e.exerciseId)
    if (ids.length >= limit) break
  }
  return ids.slice(0, limit)
}

/** A session entry for an exercise added on the fly, starting from what the user lifted last time. */
export function freeSessionExercise(exercise: Exercise, history: WorkoutHistoryLog[], now = Date.now()): Omit<PlanExercise, 'order'> {
  const previous = lastPerformance(history, exercise.id)
  return {
    id: `free-${exercise.id}-${now}`,
    exerciseId: exercise.id,
    sets: exercise.defaultSets,
    reps: previous?.reps ?? exercise.defaultReps,
    restSeconds: exercise.defaultRestSeconds,
    ...(previous?.weightKg ? { weight: previous.weightKg } : {}),
  }
}

/** Turns the logged sets of a session into a one-day plan: sets as done, reps and weight of the heaviest set. */
export function planFromSession(
  session: Pick<WorkoutSessionState, 'exercises' | 'completedSets'>,
  { name, day }: { name: string; day: DayOfWeek },
  now = new Date(),
): WorkoutPlan {
  const stamp = now.getTime()
  const items: PlanExercise[] = []
  for (const entry of session.exercises) {
    const sets = session.completedSets[entry.id] ?? []
    if (sets.length === 0) continue
    const top = sets.reduce((best, set) => ((set.weight ?? 0) > (best.weight ?? 0) ? set : best), sets[sets.length - 1])
    items.push({
      id: `${day}-${items.length + 1}-${stamp}`,
      exerciseId: entry.exerciseId,
      sets: sets.length,
      reps: top.reps,
      restSeconds: entry.restSeconds,
      order: items.length + 1,
      ...(top.weight ? { weight: top.weight } : {}),
    })
  }

  return {
    id: `plan-${stamp}`,
    name,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    schedule: Object.fromEntries(ALL_DAYS.map((d) => [d, d === day ? items : []])) as WorkoutPlan['schedule'],
  }
}
