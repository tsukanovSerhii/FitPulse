import { describe, expect, it } from 'vitest'
import { dayKeyOf, nextTrainingDay, startOfWeek } from '@/features/workoutPlan/lib/week'
import { searchPlans } from '@/features/workoutPlan/lib/search'

describe('week helpers', () => {
  it('maps dates to day keys with Monday first', () => {
    expect(dayKeyOf(new Date(2026, 10, 2))).toBe('monday')
    expect(dayKeyOf(new Date(2026, 10, 8))).toBe('sunday')
  })

  it('starts the week on Monday', () => {
    expect(startOfWeek(new Date(2026, 10, 8, 15)).getDate()).toBe(2)
    expect(startOfWeek(new Date(2026, 10, 2, 9)).getDate()).toBe(2)
  })

  it('finds the next training day, wrapping to next week', () => {
    const training = new Set(['monday', 'wednesday'])
    expect(nextTrainingDay('monday', (d) => training.has(d))).toBe('wednesday')
    expect(nextTrainingDay('friday', (d) => training.has(d))).toBe('monday')
    expect(nextTrainingDay('friday', () => false)).toBeNull()
  })
})

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
