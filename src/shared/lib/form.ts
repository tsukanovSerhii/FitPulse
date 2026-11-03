import { useState, type FormEvent } from 'react'
import { z } from 'zod/mini'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

/** Validates with a schema and keeps the first message for each top-level field. */
export function validate<S extends z.ZodMiniType>(
  schema: S,
  values: unknown,
): { success: true; data: z.output<S>; errors: FieldErrors<z.input<S>> } | { success: false; errors: FieldErrors<z.input<S>> } {
  const result = z.safeParse(schema, values)
  if (result.success) return { success: true, data: result.data, errors: {} }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? '')
    if (field && !errors[field]) errors[field] = issue.message
  }
  return { success: false, errors: errors as FieldErrors<z.input<S>> }
}

/** Form state driven by a Zod schema: values, per-field errors cleared on edit, and a validated submit. */
export function useZodForm<S extends z.ZodMiniType<unknown, Record<string, unknown>>>(schema: S, initial: z.input<S>) {
  const [values, setValues] = useState<z.input<S>>(initial)
  const [errors, setErrors] = useState<FieldErrors<z.input<S>>>({})

  const set = <K extends keyof z.input<S>>(field: K, value: z.input<S>[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (onValid: (data: z.output<S>) => void | Promise<void>) => async (event?: FormEvent) => {
    event?.preventDefault()
    const result = validate(schema, values)
    setErrors(result.errors)
    if (result.success) await onValid(result.data)
  }

  return { values, errors, set, setErrors, setValues, handleSubmit }
}

const rangeMessage = (min: number, max: number, unit = '') => `Від ${min} до ${max}${unit && ` ${unit}`}`

/** Whole number within [min, max], with a readable message for empty or out-of-range input. */
export const intInRange = (min: number, max: number, unit?: string) =>
  z.int({ error: 'Вкажіть ціле число' }).check(z.gte(min, rangeMessage(min, max, unit)), z.lte(max, rangeMessage(min, max, unit)))

export const numberInRange = (min: number, max: number, unit?: string) =>
  z.number({ error: 'Вкажіть число' }).check(z.gte(min, rangeMessage(min, max, unit)), z.lte(max, rangeMessage(min, max, unit)))

export const text = (min: number, max: number, minMessage: string, maxMessage = `Не більше ${max} символів`) =>
  z.string().check(z.trim(), ...(min > 0 ? [z.minLength(min, minMessage)] : []), z.maxLength(max, maxMessage))
