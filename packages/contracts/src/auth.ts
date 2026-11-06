import { z } from 'zod'

export const MIN_PASSWORD_LENGTH = 8

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Вкажіть коректний email'))

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Щонайменше ${MIN_PASSWORD_LENGTH} символів`)
  .max(128, 'Пароль задовгий')

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Ім'я має містити щонайменше 2 символи")
  .max(60, "Ім'я задовге")

export const registerRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  remember: z.boolean(),
})

// Any non-empty password: accounts made before the server may have older, shorter passwords
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Вкажіть пароль').max(128),
  remember: z.boolean(),
})

export const forgotPasswordRequestSchema = z.object({ email: emailSchema })

export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})

export const updateMeRequestSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  currentPassword: z.string().min(1).max(128).optional(),
})

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  plan: z.enum(['free', 'pro']),
  createdAt: z.string(),
})

export const adminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  role: z.enum(['manager', 'admin']),
  createdAt: z.string(),
})

export const authResponseSchema = z.object({ accessToken: z.string(), user: userSchema })
export const adminAuthResponseSchema = z.object({ accessToken: z.string(), user: adminUserSchema })

export type RegisterRequest = z.infer<typeof registerRequestSchema>
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>
export type UpdateMeRequest = z.infer<typeof updateMeRequestSchema>
export type User = z.infer<typeof userSchema>
export type AdminUser = z.infer<typeof adminUserSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type AdminAuthResponse = z.infer<typeof adminAuthResponseSchema>
