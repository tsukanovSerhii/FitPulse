import type { UserProfile } from '@/features/profile/model/types'

export const INITIAL_PROFILE: UserProfile = {
  name: 'Олександр Коваленко',
  email: 'alex.kovalenko@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  gender: 'male',
  age: 24,
  heightCm: 180,
  weightKg: 78,
  targetWeightKg: 82,
  fitnessGoal: 'muscle_gain',
  activityLevel: 'moderate',
  joinedDate: '2026-01-01T00:00:00.000Z',
}
