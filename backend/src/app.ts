import cors from '@fastify/cors'
import type { PrismaClient } from '@fitpulse/db'
import { createBaseApp, healthRoutes, type Redis } from '@fitpulse/server-core'
import type { ApiConfig } from './config.js'

export interface AppDeps {
  config: ApiConfig
  prisma: Pick<PrismaClient, '$queryRaw' | '$disconnect'>
  redis: Pick<Redis, 'ping' | 'quit'>
}

export async function buildApp({ config, prisma, redis }: AppDeps) {
  const app = createBaseApp({
    logger:
      config.NODE_ENV === 'development'
        ? { level: config.LOG_LEVEL, transport: { target: 'pino-pretty' } }
        : config.NODE_ENV === 'test'
          ? false
          : { level: config.LOG_LEVEL },
  })

  // Production serves the API on the frontend's own domain through nginx; CORS is only for local tools
  if (config.CORS_ORIGIN) await app.register(cors, { origin: config.CORS_ORIGIN.split(','), credentials: true })

  await app.register(healthRoutes, {
    prefix: '/api',
    checks: {
      database: () => prisma.$queryRaw`SELECT 1`,
      redis: () => redis.ping(),
    },
  })

  app.addHook('onClose', async () => {
    await Promise.allSettled([prisma.$disconnect(), redis.quit()])
  })

  return app
}
