const SECONDARY = 'color-mix(in srgb, var(--accent) 45%, var(--surface-2))'

/** Colors for each body region: the primary muscle, its helpers, and the rest. */
export interface MusclePaint {
  fill: (region: string) => string
  stroke: (region: string) => string
}

export function createMusclePaint(primary: string, groups: readonly string[]): MusclePaint {
  const status = (muscle: string) => (muscle === primary ? 'primary' : groups.includes(muscle) ? 'secondary' : 'inactive')
  return {
    fill: (m) => ({ primary: 'var(--accent)', secondary: SECONDARY, inactive: 'var(--surface-2)' })[status(m)],
    stroke: (m) => ({ primary: 'var(--accent)', secondary: SECONDARY, inactive: 'var(--line-strong)' })[status(m)],
  }
}
