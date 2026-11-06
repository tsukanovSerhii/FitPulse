import { describe, expect, it } from 'vitest'
import { INITIAL_PROFILE } from '../api/seed'
import { needsOnboarding } from './onboarding'

describe('needsOnboarding', () => {
  it('a profile still equal to the demo one needs onboarding', () => {
    expect(needsOnboarding({ ...INITIAL_PROFILE, name: 'Ira', email: 'ira@mail.com', joinedDate: '2026-11-07T00:00:00.000Z' })).toBe(true)
  })

  it('a profile the user already changed does not', () => {
    expect(needsOnboarding({ ...INITIAL_PROFILE, weightKg: 64 })).toBe(false)
  })

  it('a finished onboarding does not, even with demo-like numbers', () => {
    expect(needsOnboarding({ ...INITIAL_PROFILE, onboardedAt: '2026-11-07T10:00:00.000Z' })).toBe(false)
  })
})
