import { createPrismaClient } from '@fitpulse/db'
import { createRedis, startServer } from '@fitpulse/server-core'
import { buildApp } from './app.js'
import { loadConfig } from './config.js'

await startServer(loadConfig, (config) =>
  buildApp({ config, prisma: createPrismaClient(config.DATABASE_URL), redis: createRedis(config.REDIS_URL) }),
)
