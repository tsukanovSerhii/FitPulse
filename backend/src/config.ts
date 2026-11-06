import { baseEnvSchema, mailEnvSchema, parseConfig } from '@fitpulse/server-core'
import { z } from 'zod'

export const apiEnvSchema = z.intersection(
  baseEnvSchema.extend({
    PORT: z.coerce.number().int().positive().default(3000),
    JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
    /** Public address of the app, used in password reset links */
    APP_URL: z.string().url().default('http://localhost:5173'),
    RATE_LIMIT_ENABLED: z.stringbool().default(true),
  }),
  mailEnvSchema,
)

export type ApiConfig = z.infer<typeof apiEnvSchema>

export function loadConfig(env: Record<string, string | undefined> = process.env): ApiConfig {
  return parseConfig(apiEnvSchema, env)
}
