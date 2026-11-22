import { describe, expect, it } from 'vitest'
import { BUILT_IN_EXERCISES } from '@/features/exercises/catalog'
import { PLAN_TEMPLATES } from '@/features/workoutPlan/catalog'
import { FAQ } from './faq'
import { LANDING_STATS } from './stats'

describe('landing numbers', () => {
  it('match the exercise catalog and the program library', () => {
    expect(LANDING_STATS.exercises).toBe(BUILT_IN_EXERCISES.length)
    expect(LANDING_STATS.programs).toBe(PLAN_TEMPLATES.length)
  })

  it('are the ones the FAQ quotes', () => {
    expect(FAQ.some((item) => item.answer.includes(`${LANDING_STATS.exercises} вправ`))).toBe(true)
  })
})
