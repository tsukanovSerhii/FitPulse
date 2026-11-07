import cors from '@fastify/cors'
import type { FastifyServerOptions } from 'fastify'
import { createBaseApp } from './app.js'
import { registerCookies } from './auth/guards.js'
import { registerClientIp } from './client-ip.js'
import type { BaseConfig } from './config.js'
import { healthRoutes } from './health.js'

/** The parts of PrismaClient and ioredis a service needs for health checks and shutdown. */
export interface ServiceDeps<C extends BaseConfig = BaseConfig> {
  config: C
  prisma: { $queryRaw(query: TemplateStringsArray): PromiseLike<unknown>; $disconnect(): Promise<void> }
  redis: { ping(): Promise<unknown>; quit(): Promise<unknown> }
}

function loggerFor(config: BaseConfig): FastifyServerOptions['logger'] {
  if (config.NODE_ENV === 'test') return false
  if (config.NODE_ENV === 'development') return { level: config.LOG_LEVEL, transport: { target: 'pino-pretty' } }
  return { level: config.LOG_LEVEL }
}

/** A backend with logging, optional CORS, /api/health checks for Postgres and Redis, and clean shutdown. */
export async function buildServiceApp({ config, prisma, redis }: ServiceDeps) {
  const app = createBaseApp({ logger: loggerFor(config) })
  registerClientIp(app, config.PROXY_SECRET)

  // Production serves each API on its frontend's domain through nginx; CORS is only for local tools
  if (config.CORS_ORIGIN) await app.register(cors, { origin: config.CORS_ORIGIN.split(','), credentials: true })

  await registerCookies(app)

  await app.register(healthRoutes, {
    prefix: '/api',
    checks: {
      database: () => Promise.resolve(prisma.$queryRaw`SELECT 1`),
      redis: () => redis.ping(),
    },
  })

  app.addHook('onClose', async () => {
    await Promise.allSettled([prisma.$disconnect(), redis.quit()])
  })

  return app
}
