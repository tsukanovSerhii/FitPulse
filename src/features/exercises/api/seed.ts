import type { Exercise } from '../model/types'
import { ARMS } from './catalog/arms'
import { BACK } from './catalog/back'
import { CARDIO } from './catalog/cardio'
import { CHEST } from './catalog/chest'
import { CORE } from './catalog/core'
import { LEGS } from './catalog/legs'
import { SHOULDERS } from './catalog/shoulders'
import { VARIANT_GROUPS } from './catalog/variants'

const variants = new Map(
  VARIANT_GROUPS.flatMap((group) =>
    group.variants.map(([id, label], order) => [id, { group: group.id, groupName: group.name, label, order }] as const),
  ),
)

export const INITIAL_EXERCISES: Exercise[] = [...CHEST, ...BACK, ...LEGS, ...SHOULDERS, ...ARMS, ...CORE, ...CARDIO].map((exercise) => {
  const variant = variants.get(exercise.id)
  return variant ? { ...exercise, variant } : exercise
})
