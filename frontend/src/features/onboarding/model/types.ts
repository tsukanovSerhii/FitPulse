import type { Joint } from '@/features/exercises/model'
import type { FitnessGoal, UserProfile } from '@/features/profile/model'

export type Experience = 'none' | 'underYear' | 'overYear'
export type TrainingPlace = 'gym' | 'home'

export interface OnboardingAnswers {
  gender: UserProfile['gender']
  age: number
  heightCm: number
  weightKg: number
  targetWeightKg: number
  goal: FitnessGoal
  experience: Experience
  /** Training days a week, 2–6 */
  days: number
  place: TrainingPlace
  limits: Joint[]
}

export const EXPERIENCE_LABELS: Record<Experience, string> = {
  none: 'Ще не тренувався',
  underYear: 'До року',
  overYear: 'Більше року',
}

export const PLACE_LABELS: Record<TrainingPlace, string> = {
  gym: 'У залі',
  home: 'Вдома',
}
