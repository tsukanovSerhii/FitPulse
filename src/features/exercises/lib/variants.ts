import type { Equipment, Exercise, Joint } from '../model/types'

export interface CatalogEntry {
  /** The variant the card opens: the first one in group order that passed the filters */
  exercise: Exercise
  /** Variants of the same movement that passed the filters, in group order; one item for standalone exercises */
  variants: Exercise[]
}

/** One catalog card per movement, placed where its first variant appears in the list. */
export function collapseVariants(items: Exercise[]): CatalogEntry[] {
  const entries: CatalogEntry[] = []
  const byGroup = new Map<string, CatalogEntry>()
  for (const exercise of items) {
    const group = exercise.variant?.group
    if (!group) {
      entries.push({ exercise, variants: [exercise] })
      continue
    }
    const entry = byGroup.get(group)
    if (entry) entry.variants.push(exercise)
    else {
      const created = { exercise, variants: [exercise] }
      byGroup.set(group, created)
      entries.push(created)
    }
  }
  for (const entry of byGroup.values()) {
    entry.variants.sort((a, b) => a.variant!.order - b.variant!.order)
    entry.exercise = entry.variants[0]
  }
  return entries
}

/** All variants of the exercise's movement in group order, or just the exercise itself. */
export function variantsOf(exercise: Exercise, all: Exercise[]): Exercise[] {
  const group = exercise.variant?.group
  if (!group) return [exercise]
  return all.filter((e) => e.variant?.group === group).sort((a, b) => a.variant!.order - b.variant!.order)
}

/**
 * Exercises that can replace this one when its equipment is busy: same main muscle, other movements,
 * at most one variant per movement. With `available`, only equipment the user has (bodyweight always fits).
 */
export function alternativesFor(exercise: Exercise, all: Exercise[], { limit = 3, available = [] as Equipment[], avoid = [] as Joint[] } = {}): Exercise[] {
  const fits = (e: Exercise) =>
    (available.length === 0 || e.equipment === 'bodyweight' || available.includes(e.equipment)) && !e.stress?.some((j) => avoid.includes(j))
  const score = (e: Exercise) => {
    let s = e.muscleGroups.filter((m) => exercise.muscleGroups.includes(m)).length * 0.5
    if (e.equipment !== exercise.equipment) s += 0.5
    if (e.difficulty === exercise.difficulty) s += 0.25
    return s
  }

  const ranked = all
    .filter((e) => e.primaryMuscle === exercise.primaryMuscle && e.id !== exercise.id && fits(e))
    .filter((e) => !exercise.variant || e.variant?.group !== exercise.variant.group)
    .map((e, index) => ({ e, index, s: score(e) }))
    .sort((a, b) => b.s - a.s || a.index - b.index)

  const result: Exercise[] = []
  const usedGroups = new Set<string>()
  for (const { e } of ranked) {
    if (e.variant && usedGroups.has(e.variant.group)) continue
    if (e.variant) usedGroups.add(e.variant.group)
    result.push(e)
    if (result.length === limit) break
  }
  return result
}

/** Everything an exercise can be found by. */
export const searchText = (e: Pick<Exercise, 'name' | 'aliases'> & { variant?: Exercise['variant'] }) =>
  [e.name, e.variant?.groupName, e.aliases].filter(Boolean).join(' ')
