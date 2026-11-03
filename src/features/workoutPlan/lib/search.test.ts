import { describe, expect, it } from 'vitest'
import { searchPlans } from './search'

describe('searchPlans', () => {
  const empty = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
  const plan = (id: string, name: string, exerciseId?: string) => ({
    id,
    name,
    createdAt: '',
    updatedAt: '',
    schedule: { ...empty, monday: exerciseId ? [{ id: 'x', exerciseId, sets: 3, reps: 8, restSeconds: 60, order: 1 }] : [] },
  })
  const plans = [plan('a', 'Full Body'), plan('b', 'Push Pull Legs', 'bench')]
  const exercises = [{ id: 'bench', name: 'Жим штанги лежачи' }]

  it('matches by plan name or scheduled exercise', () => {
    expect(searchPlans(plans, exercises, 'push', null).map((p) => p.id)).toEqual(['b'])
    expect(searchPlans(plans, exercises, 'жим', null).map((p) => p.id)).toEqual(['b'])
  })

  it('puts the active plan first', () => {
    expect(searchPlans(plans, exercises, '', 'b').map((p) => p.id)).toEqual(['b', 'a'])
  })
})
