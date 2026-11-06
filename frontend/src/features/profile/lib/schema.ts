import { z } from 'zod/mini'
import { intInRange, numberInRange, text } from '@/shared/lib/form'
import { ACTIVITY_LEVEL_LABELS, FITNESS_GOAL_LABELS, type ActivityLevel, type FitnessGoal } from '../model/types'

const keys = <T extends string>(labels: Record<T, string>) => Object.keys(labels) as [T, ...T[]]

export const profileFormSchema = z.object({
  name: text(2, 60, "Ім'я має містити щонайменше 2 символи"),
  age: intInRange(12, 120, 'р.'),
  heightCm: intInRange(100, 250, 'см'),
  weightKg: numberInRange(30, 300, 'кг'),
  targetWeightKg: numberInRange(30, 300, 'кг'),
  gender: z.enum(['male', 'female', 'other']),
  fitnessGoal: z.enum(keys<FitnessGoal>(FITNESS_GOAL_LABELS)),
  activityLevel: z.enum(keys<ActivityLevel>(ACTIVITY_LEVEL_LABELS)),
})

export type ProfileForm = z.output<typeof profileFormSchema>
