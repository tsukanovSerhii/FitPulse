export { default as profileReducer, createProfileFor, fetchProfile, resetProfileAsync, updateProfileAsync } from './profileSlice'
export { ACTIVITY_LEVEL_LABELS, FITNESS_GOAL_LABELS, type UserProfile } from './types'
export { needsOnboarding } from '../lib/onboarding'
export type { ActivityLevel, FitnessGoal } from './types'
