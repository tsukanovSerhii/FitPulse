import type { Credentials, RegistrationData } from '../model/types'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const MIN_PASSWORD_LENGTH = 8

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function validateLogin({ email, password }: Credentials): FieldErrors<Credentials> {
  const errors: FieldErrors<Credentials> = {}
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Вкажіть коректний email'
  if (!password) errors.password = 'Вкажіть пароль'
  return errors
}

export function validateRegistration({ name, email, password }: RegistrationData): FieldErrors<RegistrationData> {
  const errors: FieldErrors<RegistrationData> = {}
  if (name.trim().length < 2) errors.name = "Ім'я має містити щонайменше 2 символи"
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Вкажіть коректний email'
  if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Щонайменше ${MIN_PASSWORD_LENGTH} символів`
  else if (!/\d/.test(password) || !/[a-zA-Zа-яА-ЯіІїЇєЄґҐ]/.test(password)) errors.password = 'Додайте літери й цифри'
  return errors
}

export function passwordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= MIN_PASSWORD_LENGTH) score++
  if (/\d/.test(password)) score++
  if (/[a-zа-яіїєґ]/.test(password) && /[A-ZА-ЯІЇЄҐ]/.test(password)) score++
  if (/[^\w\s]/.test(password) || password.length >= 14) score++
  return score
}
