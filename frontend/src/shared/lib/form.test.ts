import { describe, expect, it } from 'vitest'
import { z } from 'zod/mini'
import { intInRange, numberInRange, text, validate } from './form'

const schema = z.object({
  name: text(2, 10, 'Закоротко'),
  sets: intInRange(1, 20),
  weight: z.optional(numberInRange(0, 500, 'кг')),
})

describe('validate', () => {
  it('returns trimmed data when the input is valid', () => {
    const result = validate(schema, { name: '  Жим  ', sets: 4 })
    expect(result).toEqual({ success: true, data: { name: 'Жим', sets: 4 }, errors: {} })
  })

  it('keeps the first message per field', () => {
    const result = validate(schema, { name: ' a ', sets: 2.5, weight: 600 })
    expect(result.success).toBe(false)
    expect(result.errors).toEqual({ name: 'Закоротко', sets: 'Вкажіть ціле число', weight: 'Від 0 до 500 кг' })
  })

  it('treats empty number inputs as missing values with a readable message', () => {
    expect(validate(schema, { name: 'Жим', sets: Number.NaN }).errors.sets).toBe('Вкажіть ціле число')
    expect(validate(schema, { name: 'Жим', sets: 0 }).errors.sets).toBe('Від 1 до 20')
  })
})
