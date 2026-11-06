import { baseEnvSchema, parseConfig } from '@fitpulse/server-core'
import { z } from 'zod'

export const adminEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(3001),
  ADMIN_JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
})

export type AdminConfig = z.infer<typeof adminEnvSchema>

export function loadConfig(env: Record<string, string | undefined> = process.env): AdminConfig {
  return parseConfig(adminEnvSchema, env)
}
