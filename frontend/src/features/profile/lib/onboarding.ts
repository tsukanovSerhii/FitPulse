import { INITIAL_PROFILE } from '../api/seed'
import type { UserProfile } from '../model/types'

// Body and goal fields of the placeholder profile every account starts with
const PLACEHOLDER_FIELDS = ['gender', 'age', 'heightCm', 'weightKg', 'targetWeightKg', 'fitnessGoal', 'activityLevel'] as const

/** True until the questionnaire is done, unless the user already set their own numbers. */
export function needsOnboarding(profile: UserProfile): boolean {
  if (profile.onboardedAt) return false
  return PLACEHOLDER_FIELDS.every((field) => profile[field] === INITIAL_PROFILE[field])
}
