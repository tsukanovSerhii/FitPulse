import type { MuscleGroup } from '../../model/types'

const SECONDARY = 'color-mix(in srgb, var(--accent) 45%, var(--surface-2))'

export interface MusclePaint {
  fill: (muscle: MuscleGroup) => string
  stroke: (muscle: MuscleGroup) => string
}

export function createMusclePaint(primary: MuscleGroup, groups: MuscleGroup[]): MusclePaint {
  const status = (muscle: MuscleGroup) => (muscle === primary ? 'primary' : groups.includes(muscle) ? 'secondary' : 'inactive')
  return {
    fill: (m) => ({ primary: 'var(--accent)', secondary: SECONDARY, inactive: 'var(--surface-2)' })[status(m)],
    stroke: (m) => ({ primary: 'var(--accent)', secondary: SECONDARY, inactive: 'var(--line-strong)' })[status(m)],
  }
}
