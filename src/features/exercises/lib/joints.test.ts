import { describe, expect, it } from 'vitest'
import { INITIAL_EXERCISES } from '../api/seed'
import { JOINT_STRESS } from '../api/catalog/joints'
import reducer, { setMyLimits } from '../model/exercisesSlice'
import { alternativesFor } from './variants'

const byId = (id: string) => INITIAL_EXERCISES.find((e) => e.id === id)!

describe('joint limits', () => {
  it('tags only real exercises', () => {
    for (const id of Object.keys(JOINT_STRESS)) expect(byId(id), id).toBeDefined()
    expect(byId('ex-barbell-squat').stress).toEqual(['knees', 'back'])
    expect(byId('ex-lateral-raises').stress).toBeUndefined()
  })

  it('replacements skip exercises that load a protected joint', () => {
    const alternatives = alternativesFor(byId('ex-barbell-squat'), INITIAL_EXERCISES, { limit: 5, avoid: ['knees'] })
    expect(alternatives.length).toBeGreaterThan(0)
    for (const e of alternatives) expect(e.stress ?? []).not.toContain('knees')
  })

  it('hides those exercises from the catalog', () => {
    const loaded = reducer(undefined, { type: 'exercises/fetchExercises/fulfilled', payload: { items: INITIAL_EXERCISES, favorites: [], equipment: [], notes: {}, limits: [] } })
    const state = reducer(loaded, { type: setMyLimits.pending.type, meta: { arg: ['shoulders'] } })
    expect(state.filteredItems.some((e) => e.id === 'ex-bench-press')).toBe(false)
    expect(state.filteredItems.some((e) => e.id === 'ex-machine-chest-press')).toBe(true)
  })
})
