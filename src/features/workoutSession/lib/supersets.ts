export interface SupersetEntry {
  id: string
  sets: number
  group?: string
}

export interface NextStep {
  /** Entry to show next, or null to stay */
  index: number | null
  /** Whether a rest should start now */
  rest: boolean
}

/**
 * Where to go after a set in a superset: on to the next exercise of the group without rest, or,
 * after the last one of the round, rest and back to the first exercise that still has sets.
 * `done` holds working sets per entry including the set just logged.
 */
export function nextInSuperset(entries: SupersetEntry[], current: number, done: Record<string, number>): NextStep | null {
  const group = entries[current]?.group
  if (!group) return null
  const members = entries.map((entry, index) => ({ entry, index })).filter(({ entry }) => entry.group === group)
  if (members.length < 2) return null

  const left = (index: number) => entries[index].sets - (done[entries[index].id] ?? 0)
  const later = members.find(({ index }) => index > current && left(index) > 0)
  if (later) return { index: later.index, rest: false }

  const first = members.find(({ index }) => left(index) > 0)
  return first ? { index: first.index, rest: true } : { index: null, rest: false }
}

/** Position of an entry within its superset: { position: 1, size: 2 } for the first of two. */
export function supersetPosition(entries: SupersetEntry[], index: number): { position: number; size: number } | null {
  const group = entries[index]?.group
  if (!group) return null
  const members = entries.filter((entry) => entry.group === group)
  if (members.length < 2) return null
  return { position: members.indexOf(entries[index]) + 1, size: members.length }
}
