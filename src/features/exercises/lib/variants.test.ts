import { describe, expect, it } from 'vitest'
import { INITIAL_EXERCISES } from '../api/seed'
import { VARIANT_GROUPS } from '../api/catalog/variants'
import { alternativesFor, collapseVariants, variantsOf } from './variants'

const byId = (id: string) => INITIAL_EXERCISES.find((e) => e.id === id)!

describe('variant groups', () => {
  it('reference catalog exercises, each in one group only', () => {
    const ids = VARIANT_GROUPS.flatMap((g) => g.variants.map(([id]) => id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(byId(id), id).toBeDefined()
  })

  it('variants share the main muscle of their movement', () => {
    for (const group of VARIANT_GROUPS) {
      const muscles = new Set(group.variants.map(([id]) => byId(id).primaryMuscle))
      expect(muscles.size, group.id).toBe(1)
    }
  })
})

describe('collapseVariants', () => {
  it('shows one card per movement and keeps standalone exercises', () => {
    const entries = collapseVariants(INITIAL_EXERCISES)
    const bench = entries.find((e) => e.exercise.variant?.group === 'bench-press')!
    expect(bench.exercise.id).toBe('ex-bench-press')
    expect(bench.variants.map((v) => v.variant!.label)).toEqual(['Штанга', 'Гантелі', 'Сміт', 'Тренажер'])
    expect(entries).toHaveLength(INITIAL_EXERCISES.length - VARIANT_GROUPS.reduce((n, g) => n + g.variants.length - 1, 0))
  })

  it('opens the first variant that passed the filters', () => {
    const [entry] = collapseVariants(INITIAL_EXERCISES.filter((e) => e.equipment === 'smith' && e.variant?.group === 'bench-press'))
    expect(entry.exercise.id).toBe('ex-smith-bench-press')
    expect(entry.variants).toHaveLength(1)
  })
})

describe('variantsOf', () => {
  it('lists the whole group in order', () => {
    expect(variantsOf(byId('ex-smith-squat'), INITIAL_EXERCISES).map((e) => e.id)).toEqual([
      'ex-barbell-squat',
      'ex-front-squat',
      'ex-smith-squat',
      'ex-hack-squat',
      'ex-goblet-squat',
    ])
    expect(variantsOf(byId('ex-plank'), INITIAL_EXERCISES)).toEqual([byId('ex-plank')])
  })
})

describe('alternativesFor', () => {
  it('suggests other movements for the same muscle, one per movement', () => {
    const alternatives = alternativesFor(byId('ex-bench-press'), INITIAL_EXERCISES)
    expect(alternatives).toHaveLength(3)
    for (const e of alternatives) {
      expect(e.primaryMuscle).toBe('chest')
      expect(e.variant?.group).not.toBe('bench-press')
    }
    const groups = alternatives.flatMap((e) => (e.variant ? [e.variant.group] : []))
    expect(new Set(groups).size).toBe(groups.length)
  })

  it('keeps to the equipment the user has', () => {
    const alternatives = alternativesFor(byId('ex-lat-pulldown'), INITIAL_EXERCISES, { available: ['dumbbell'] })
    expect(alternatives.length).toBeGreaterThan(0)
    for (const e of alternatives) expect(['dumbbell', 'bodyweight']).toContain(e.equipment)
  })
})
