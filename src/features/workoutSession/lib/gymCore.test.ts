import { describe, expect, it } from 'vitest'
import { suggestNext, weightStep } from './progression'
import { nextInSuperset, supersetPosition } from './supersets'

const bench = { equipment: 'barbell' as const, primaryMuscle: 'chest' as const, muscleGroups: ['chest', 'triceps'] as const }
const curl = { equipment: 'dumbbell' as const, primaryMuscle: 'biceps' as const, muscleGroups: ['biceps'] as const }
const pullUp = { equipment: 'bodyweight' as const, primaryMuscle: 'back' as const, muscleGroups: ['back', 'biceps'] as const }
const last = (weightKg: number | undefined, reps: number, sets: number, totalReps = reps * sets) => ({ date: '2026-11-01', weightKg, reps, sets, totalReps })

describe('suggestNext', () => {
  const target = { sets: 3, reps: 8 }

  it('adds weight to a compound lift after every rep was done', () => {
    expect(suggestNext(last(80, 8, 3), target, { ...bench, muscleGroups: [...bench.muscleGroups] })).toMatchObject({ weight: 82.5, reps: 8, kind: 'weight', text: expect.stringContaining('82,5 кг × 8 — на 2,5 кг більше') })
  })

  it('repeats the weight when the target was missed', () => {
    expect(suggestNext(last(80, 8, 3, 21), target, { ...bench, muscleGroups: [...bench.muscleGroups] })).toMatchObject({ weight: 80, kind: 'repeat' })
  })

  it('adds reps to isolation first, then weight', () => {
    const muscles = { ...curl, muscleGroups: [...curl.muscleGroups] }
    expect(suggestNext(last(14, 8, 3), target, muscles)).toMatchObject({ weight: 14, reps: 9, kind: 'reps' })
    expect(suggestNext(last(14, 10, 3), target, muscles)).toMatchObject({ weight: 16, reps: 8, kind: 'weight' })
  })

  it('speaks in reps, not kilograms, for bodyweight exercises', () => {
    const muscles = { ...pullUp, muscleGroups: [...pullUp.muscleGroups] }
    const more = suggestNext(last(undefined, 8, 3), target, muscles)!
    expect(more).toMatchObject({ reps: 9, kind: 'reps' })
    expect(more.text).toBe('Спробуйте 9 повторів у підході — на один більше, ніж минулого разу.')
    expect(suggestNext(last(undefined, 6, 3, 18), target, muscles)!.text).not.toMatch(/кг/)
  })

  it('has nothing to say without a previous session', () => {
    expect(suggestNext(null, target, { ...bench, muscleGroups: [...bench.muscleGroups] })).toBeNull()
  })

  it('moves heavy leg lifts by 5 kg', () => {
    expect(weightStep({ equipment: 'barbell', primaryMuscle: 'legs' }, 100)).toBe(5)
    expect(weightStep({ equipment: 'barbell', primaryMuscle: 'legs' }, 40)).toBe(2.5)
  })
})

describe('supersets', () => {
  const entries = [
    { id: 'a', sets: 3 },
    { id: 'b', sets: 3, group: 'g' },
    { id: 'c', sets: 3, group: 'g' },
    { id: 'd', sets: 3 },
  ]

  it('goes to the next exercise of the round without rest', () => {
    expect(nextInSuperset(entries, 1, { b: 1 })).toEqual({ index: 2, rest: false })
  })

  it('rests after the round and returns to the first exercise', () => {
    expect(nextInSuperset(entries, 2, { b: 1, c: 1 })).toEqual({ index: 1, rest: true })
  })

  it('finishes the group once every set is done', () => {
    expect(nextInSuperset(entries, 2, { b: 3, c: 3 })).toEqual({ index: null, rest: false })
  })

  it('ignores exercises outside a superset', () => {
    expect(nextInSuperset(entries, 0, { a: 1 })).toBeNull()
    expect(supersetPosition(entries, 2)).toEqual({ position: 2, size: 2 })
    expect(supersetPosition(entries, 3)).toBeNull()
  })
})
