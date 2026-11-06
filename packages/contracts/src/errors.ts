import { z } from 'zod'

export const ErrorCode = {
  NotFound: 'NOT_FOUND',
  Validation: 'VALIDATION_ERROR',
  Internal: 'INTERNAL_ERROR',
  ServiceUnavailable: 'SERVICE_UNAVAILABLE',
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
