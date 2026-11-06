import { describe, expect, it } from 'vitest'
import { PLAN_TEMPLATES } from '@/features/workoutPlan/catalog'
import { templateDays } from '@/features/workoutPlan/model'
import type { OnboardingAnswers } from '../model/types'
import { activityFor, equipmentFor, profileFromAnswers, recommendTemplates } from './answers'

const answers: OnboardingAnswers = {
  gender: 'female',
  age: 29,
  heightCm: 168,
  weightKg: 64,
  targetWeightKg: 60,
  goal: 'muscle_gain',
  experience: 'overYear',
  days: 4,
  place: 'gym',
  limits: [],
}

describe('recommendTemplates', () => {
  it('returns three programs, best match first', () => {
    const picks = recommendTemplates(PLAN_TEMPLATES, answers)
    expect(picks).toHaveLength(3)
    expect(picks[0]!.goal).toBe('muscle')
    expect(picks[0]!.level).toBe('intermediate')
  })

  it('days closer to the chosen ones rank higher', () => {
    const picks = recommendTemplates(PLAN_TEMPLATES, { ...answers, days: 3 })
    expect(Math.abs(templateDays(picks[0]!).length - 3)).toBeLessThanOrEqual(1)
  })

  it('at home it only offers home programs', () => {
    const picks = recommendTemplates(PLAN_TEMPLATES, { ...answers, place: 'home' })
    expect(picks.length).toBeGreaterThan(0)
    expect(picks.every((t) => t.home)).toBe(true)
  })

  it('a beginner gets beginner programs first', () => {
    const picks = recommendTemplates(PLAN_TEMPLATES, { ...answers, goal: 'general_health', experience: 'none', days: 3 })
    expect(picks[0]!.level).toBe('beginner')
  })
})

describe('mapping answers', () => {
  it('activity follows the number of training days', () => {
    expect(activityFor(2)).toBe('light')
    expect(activityFor(4)).toBe('moderate')
    expect(activityFor(6)).toBe('active')
  })

  it('home means dumbbells, bodyweight and bands; the gym means everything', () => {
    expect(equipmentFor('home')).toEqual(['dumbbell', 'bodyweight', 'bands'])
    expect(equipmentFor('gym')).toEqual([])
  })

  it('the profile takes the answers and marks onboarding as done', () => {
    const base = { name: 'Ira', email: 'ira@mail.com', joinedDate: '2026-11-07T00:00:00.000Z' } as never
    const now = new Date('2026-11-07T10:00:00.000Z')
    expect(profileFromAnswers(base, answers, now)).toMatchObject({
      name: 'Ira',
      gender: 'female',
      age: 29,
      heightCm: 168,
      weightKg: 64,
      targetWeightKg: 60,
      fitnessGoal: 'muscle_gain',
      activityLevel: 'moderate',
      onboardedAt: '2026-11-07T10:00:00.000Z',
    })
  })
})
