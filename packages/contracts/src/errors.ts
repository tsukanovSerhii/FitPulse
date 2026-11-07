import { z } from 'zod'

export const ErrorCode = {
  NotFound: 'NOT_FOUND',
  Validation: 'VALIDATION_ERROR',
  Internal: 'INTERNAL_ERROR',
  ServiceUnavailable: 'SERVICE_UNAVAILABLE',
  EmailTaken: 'EMAIL_TAKEN',
  InvalidCredentials: 'INVALID_CREDENTIALS',
  AccountBlocked: 'ACCOUNT_BLOCKED',
  AccountDisabled: 'ACCOUNT_DISABLED',
  Unauthorized: 'UNAUTHORIZED',
  SessionExpired: 'SESSION_EXPIRED',
  RefreshRetry: 'REFRESH_RETRY',
  ResetTokenInvalid: 'RESET_TOKEN_INVALID',
  Forbidden: 'FORBIDDEN',
  RateLimited: 'RATE_LIMITED',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
})

export type ErrorResponse = z.infer<typeof errorResponseSchema>
