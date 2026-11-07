import { baseEnvSchema, mailEnvSchema, parseConfig } from '@fitpulse/server-core'
import { z } from 'zod'

export const apiEnvSchema = z.intersection(
  baseEnvSchema.extend({
    PORT: z.coerce.number().int().positive().default(3000),
    JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
    /** Public address of the app, used in password reset links */
    APP_URL: z.string().url().optional(),
    RATE_LIMIT_ENABLED: z.stringbool().default(true),
  }),
  mailEnvSchema,
)

// Production must not fall back to defaults that leak reset links or trust nobody's IP
const productionSchema = apiEnvSchema.superRefine((env, ctx) => {
  if (env.NODE_ENV !== 'production') return
  if (env.MAIL_PROVIDER === 'log') ctx.addIssue({ code: 'custom', path: ['MAIL_PROVIDER'], message: 'log would write reset links to the logs; use resend or smtp' })
  if (!env.APP_URL) ctx.addIssue({ code: 'custom', path: ['APP_URL'], message: 'required in production for reset links' })
  if (!env.PROXY_SECRET) ctx.addIssue({ code: 'custom', path: ['PROXY_SECRET'], message: 'required in production so rate limits see the visitor address' })
})

export type ApiConfig = z.infer<typeof apiEnvSchema> & { APP_URL: string }

export function loadConfig(env: Record<string, string | undefined> = process.env): ApiConfig {
  const config = parseConfig(productionSchema, env)
  return { ...config, APP_URL: config.APP_URL ?? 'http://localhost:5173' }
}
