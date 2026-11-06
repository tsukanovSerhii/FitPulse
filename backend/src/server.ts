import { createPrismaClient } from '@fitpulse/db'
import { ConfigError, createRedis } from '@fitpulse/server-core'
import { buildApp } from './app.js'
import { loadConfig } from './config.js'

let config
try {
  config = loadConfig()
} catch (error) {
  if (error instanceof ConfigError) {
    console.error(error.message)
    process.exit(1)
  }
  throw error
}

const app = await buildApp({
  config,
  prisma: createPrismaClient(config.DATABASE_URL),
  redis: createRedis(config.REDIS_URL),
})

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    app.close().then(() => process.exit(0))
  })
}

await app.listen({ port: config.PORT, host: config.HOST })
