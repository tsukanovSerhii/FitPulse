import { healthResponseSchema, readinessResponseSchema, type ReadinessResponse } from '@fitpulse/contracts'
import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

export interface HealthRoutesOptions {
  checks: Record<string, () => Promise<unknown>>
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 2000

async function runCheck(check: () => Promise<unknown>, timeoutMs: number): Promise<'ok' | 'fail'> {
  let timer: NodeJS.Timeout | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), timeoutMs)
  })
  try {
    await Promise.race([check(), timeout])
    return 'ok'
  } catch {
    return 'fail'
  } finally {
    clearTimeout(timer)
  }
}

const plugin: FastifyPluginAsync<HealthRoutesOptions> = async (app, opts) => {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const typed = app.withTypeProvider<ZodTypeProvider>()

  // Liveness: never touches the database, so a sleeping database does not restart the service
  typed.get('/health', { schema: { response: { 200: healthResponseSchema } } }, async () => ({ status: 'ok' as const }))

  typed.get(
    '/health/ready',
    { schema: { response: { 200: readinessResponseSchema, 503: readinessResponseSchema } } },
    async (_request, reply) => {
      const names = Object.keys(opts.checks)
      const results = await Promise.all(names.map((name) => runCheck(opts.checks[name]!, timeoutMs)))
      const checks = Object.fromEntries(names.map((name, i) => [name, results[i]!]))
      const ok = results.every((result) => result === 'ok')
      const body: ReadinessResponse = { status: ok ? 'ok' : 'unavailable', checks }
      return reply.status(ok ? 200 : 503).send(body)
    },
  )
}

/** GET /health (liveness) and GET /health/ready (database, Redis, ...); register with a prefix such as /api. */
export const healthRoutes = plugin
