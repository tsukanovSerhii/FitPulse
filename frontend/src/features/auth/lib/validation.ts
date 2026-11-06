import { z } from 'zod/mini'
import { validate, type FieldErrors } from '@/shared/lib/form'
import type { Credentials, RegistrationData } from '../model/types'

export type { FieldErrors }

export const MIN_PASSWORD_LENGTH = 8

export { normalizeEmail } from './email'

const email = z.string().check(z.trim(), z.regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Вкажіть коректний email'))

export const loginSchema = z.object({
  email,
  password: z.string().check(z.minLength(1, 'Вкажіть пароль')),
})

export const registrationSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(2, "Ім'я має містити щонайменше 2 символи"), z.maxLength(60, "Ім'я задовге")),
  email,
  password: z
    .string()
    .check(
      z.minLength(MIN_PASSWORD_LENGTH, `Щонайменше ${MIN_PASSWORD_LENGTH} символів`),
      z.refine((value) => /\d/.test(value) && /[a-zA-Zа-яА-ЯіІїЇєЄґҐ]/.test(value), 'Додайте літери й цифри'),
    ),
})

export const validateLogin = (values: Credentials): FieldErrors<Credentials> => validate(loginSchema, values).errors

export const validateRegistration = (values: RegistrationData): FieldErrors<RegistrationData> =>
  validate(registrationSchema, values).errors

export function passwordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= MIN_PASSWORD_LENGTH) score++
  if (/\d/.test(password)) score++
  if (/[a-zа-яіїєґ]/.test(password) && /[A-ZА-ЯІЇЄҐ]/.test(password)) score++
  if (/[^\w\s]/.test(password) || password.length >= 14) score++
  return score
}
