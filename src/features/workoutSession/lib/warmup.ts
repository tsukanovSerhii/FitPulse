import type { Equipment } from '@/features/exercises/model'
import { BAR_KG } from './strength'
import type { PlannedSet } from '../model/types'

const BAR_EQUIPMENT: Equipment[] = ['barbell', 'smith', 'ezbar']

/**
 * Ramp-up sets before a working weight: an empty bar for barbell lifts, then about 50, 70 and 85 %
 * with fewer reps each time. Light working weights need no warm-up.
 */
export function warmupSets(workWeight: number, equipment: Equipment): PlannedSet[] {
  if (workWeight < 20) return []
  const barbell = BAR_EQUIPMENT.includes(equipment)
  const step = barbell ? 2.5 : equipment === 'dumbbell' || equipment === 'kettlebell' ? 2 : 2.5
  const round = (value: number) => Math.round(value / step) * step
  const ramp = (barbell ? [0.5, 0.7, 0.85] : [0.5, 0.75]).map((share, i) => ({
    weight: round(workWeight * share),
    reps: barbell ? [5, 3, 2][i] : [8, 4][i],
  }))

  const sets = barbell && workWeight > BAR_KG * 2 ? [{ weight: BAR_KG, reps: 10 }, ...ramp] : ramp
  // Drop sets that would repeat a weight or reach the working one
  return sets.filter((set, i) => set.weight < workWeight && set.weight > 0 && (i === 0 || set.weight > sets[i - 1].weight))
}
