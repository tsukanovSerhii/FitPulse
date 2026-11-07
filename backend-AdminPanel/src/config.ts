import { baseEnvSchema, parseConfig } from '@fitpulse/server-core'
import { z } from 'zod'

export const adminEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(3001),
  ADMIN_JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
  RATE_LIMIT_ENABLED: z.stringbool().default(true),
})

const productionSchema = adminEnvSchema.superRefine((env, ctx) => {
  if (env.NODE_ENV === 'production' && !env.PROXY_SECRET) ctx.addIssue({ code: 'custom', path: ['PROXY_SECRET'], message: 'required in production so rate limits see the visitor address' })
})

export type AdminConfig = z.infer<typeof adminEnvSchema>

export function loadConfig(env: Record<string, string | undefined> = process.env): AdminConfig {
  return parseConfig(productionSchema, env)
}
