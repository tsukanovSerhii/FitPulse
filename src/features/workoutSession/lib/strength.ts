import type { WorkoutHistoryLog } from '@/features/progress'

const roundToHalf = (value: number) => Math.round(value * 2) / 2

/** Estimated one-rep max (Epley), rounded to 0.5 kg. */
export function estimateOneRepMax(weightKg: number, reps: number): number | null {
  if (weightKg <= 0 || reps <= 0) return null
  return reps === 1 ? weightKg : roundToHalf(weightKg * (1 + reps / 30))
}

export const BAR_KG = 20
const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25]

/** Plates for one side of the bar, heaviest first, and the weight standard plates cannot make. */
export function platesPerSide(totalKg: number, barKg = BAR_KG): { plates: number[]; remainder: number } {
  let left = Math.max(0, (totalKg - barKg) / 2)
  const plates: number[] = []
  for (const plate of PLATES_KG) {
    while (left >= plate - 1e-9) {
      plates.push(plate)
      left -= plate
    }
  }
  return { plates, remainder: Number((left * 2).toFixed(2)) }
}

export interface LastPerformance {
  date: string
  weightKg?: number
  reps?: number
  sets: number
  totalReps: number
}

/** Best set of an exercise in the latest session that included it. */
export function lastPerformance(history: WorkoutHistoryLog[], exerciseId: string): LastPerformance | null {
  let latest: LastPerformance | null = null
  for (const log of history) {
    const exercise = log.exercises.find((e) => e.exerciseId === exerciseId)
    if (!exercise || (latest && log.date <= latest.date)) continue
    latest = { date: log.date, weightKg: exercise.maxWeightKg, reps: exercise.repsAtMaxWeight, sets: exercise.setsCompleted, totalReps: exercise.totalReps }
  }
  return latest
}
