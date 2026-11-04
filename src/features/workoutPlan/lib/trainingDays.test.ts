import { describe, expect, it } from 'vitest'
import { assignTrainingDays, sortDays, trainingDaysOf } from './trainingDays'

describe('assignTrainingDays', () => {
  const week = { monday: ['A'], wednesday: ['B'], friday: ['C'] }

  it('puts sessions on the picked days in order', () => {
    expect(assignTrainingDays(week, ['tuesday', 'thursday', 'sunday'])).toEqual({
      monday: [],
      tuesday: ['A'],
      wednesday: [],
      thursday: ['B'],
      friday: [],
      saturday: [],
      sunday: ['C'],
    })
  })

  it('orders picked days by the week, whatever the click order', () => {
    const result = assignTrainingDays(week, ['saturday', 'monday', 'tuesday'])
    expect(trainingDaysOf(result)).toEqual(['monday', 'tuesday', 'saturday'])
    expect([result.monday, result.tuesday, result.saturday]).toEqual([['A'], ['B'], ['C']])
  })

  it('allows back-to-back days', () => {
    expect(trainingDaysOf(assignTrainingDays(week, ['friday', 'saturday', 'sunday']))).toEqual(['friday', 'saturday', 'sunday'])
  })

  it('needs one day per session', () => {
    expect(() => assignTrainingDays(week, ['monday', 'tuesday'])).toThrow()
  })

  it('sorts days Monday first', () => {
    expect(sortDays(['sunday', 'monday', 'thursday'])).toEqual(['monday', 'thursday', 'sunday'])
  })
})
