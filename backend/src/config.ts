import { baseEnvSchema, parseConfig } from '@fitpulse/server-core'
import { z } from 'zod'

export const apiEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
})

export type ApiConfig = z.infer<typeof apiEnvSchema>

export function loadConfig(env: Record<string, string | undefined> = process.env): ApiConfig {
  return parseConfig(apiEnvSchema, env)
}
