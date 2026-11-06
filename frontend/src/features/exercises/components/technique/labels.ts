import type { TechniqueStep } from '../../model/types'

export const BREATHING_LABELS: Record<NonNullable<TechniqueStep['breathing']>, string> = {
  inhale: 'вдих',
  exhale: 'видих',
  hold: 'затримка',
}
