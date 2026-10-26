export type FitnessGoal =
  | 'muscle_gain'
  | 'fat_loss'
  | 'strength'
  | 'endurance'
  | 'general_health'

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  muscle_gain: 'Набір м\'язової маси',
  fat_loss: 'Спалювання жиру / Схуднення',
  strength: 'Збільшення сили',
  endurance: 'Розвиток витривалості',
  general_health: 'Підтримка форми та здоров\'я',
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete'

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Сидячий спосіб життя',
  light: 'Легка активність (1-2 тренування на тиждень)',
  moderate: 'Помірна активність (3-4 тренування на тиждень)',
  active: 'Висока активність (5-6 тренувань на тиждень)',
  athlete: 'Професійний / щоденні інтенсивні навантаження',
}

export interface UserProfile {
  name: string
  email: string
  avatarUrl?: string
  gender: 'male' | 'female' | 'other'
  age: number
  heightCm: number
  weightKg: number
  targetWeightKg: number
  fitnessGoal: FitnessGoal
  activityLevel: ActivityLevel
  joinedDate: string
}

export interface ProfileState {
  profile: UserProfile
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
