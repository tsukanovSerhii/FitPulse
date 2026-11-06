import { z } from 'zod/mini'
import { intInRange, text } from '@/shared/lib/form'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS, type Difficulty, type Equipment, type MuscleGroup } from '../model/types'

const keys = <T extends string>(labels: Record<T, string>) => Object.keys(labels) as [T, ...T[]]

export const customExerciseSchema = z.object({
  name: text(2, 60, 'Назва має містити щонайменше 2 символи'),
  primaryMuscle: z.enum(keys<MuscleGroup>(MUSCLE_GROUP_LABELS)),
  difficulty: z.enum(keys<Difficulty>(DIFFICULTY_LABELS)),
  equipment: z.enum(keys<Equipment>(EQUIPMENT_LABELS)),
  sets: intInRange(1, 20),
  reps: intInRange(1, 200),
  rest: intInRange(10, 600, 'с'),
  description: text(0, 300, ''),
  steps: text(0, 1500, ''),
  cues: text(0, 600, ''),
  mistakes: text(0, 600, ''),
})

export type CustomExerciseForm = z.output<typeof customExerciseSchema>
