const roundToHalf = (value: number) => Math.round(value * 2) / 2

/** Estimated one-rep max (Epley), rounded to 0.5 kg. */
export function estimateOneRepMax(weightKg: number, reps: number): number | null {
  if (weightKg <= 0 || reps <= 0) return null
  return reps === 1 ? weightKg : roundToHalf(weightKg * (1 + reps / 30))
}
