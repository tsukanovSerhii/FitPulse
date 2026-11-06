import { z } from 'zod/mini'
import { intInRange, numberInRange, text } from '@/shared/lib/form'

export const planFormSchema = z.object({
  name: text(1, 60, 'Введіть назву програми'),
  description: text(0, 300, ''),
})

export const dayExerciseSchema = z.object({
  exerciseId: z.string().check(z.minLength(1, 'Оберіть вправу')),
  sets: intInRange(1, 20),
  reps: intInRange(1, 200),
  weight: z.optional(numberInRange(0, 500, 'кг')),
  restSeconds: intInRange(10, 600, 'с'),
  notes: text(0, 120, ''),
})

export type DayExerciseForm = z.output<typeof dayExerciseSchema>
