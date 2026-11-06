import { z } from 'zod'

const redisUrl = z
  .string()
  .url()
  .refine((value) => /^rediss?:\/\//.test(value), 'must start with redis:// or rediss://')

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: redisUrl,
  CORS_ORIGIN: z.string().optional(),
})

export type BaseConfig = z.infer<typeof baseEnvSchema>

export class ConfigError extends Error {
  constructor(issues: string[]) {
    super(`Invalid environment:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`)
    this.name = 'ConfigError'
  }
}

/** Validates environment variables; throws ConfigError naming every invalid variable. */
export function parseConfig<S extends z.ZodType>(schema: S, env: Record<string, string | undefined>): z.infer<S> {
  const result = schema.safeParse(env)
  if (!result.success) {
    throw new ConfigError(result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`))
  }
  return result.data
}
