import { createPrismaClient } from '@fitpulse/db'
import { createRedis } from '@fitpulse/server-core'
import { afterAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'

const config = loadConfig({
  ...process.env,
  NODE_ENV: 'test',
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET ?? 'admin-test-secret-at-least-32-characters',
})
const app = await buildApp({ config, prisma: createPrismaClient(config.DATABASE_URL), redis: createRedis(config.REDIS_URL) })

afterAll(() => app.close())

describe('admin api readiness', () => {
  it('ready is ok against real Postgres and Redis', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health/ready' })
    expect(res.json()).toEqual({ status: 'ok', checks: { database: 'ok', redis: 'ok' } })
    expect(res.statusCode).toBe(200)
  })
})
