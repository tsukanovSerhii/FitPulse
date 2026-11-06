import { ConfigError } from '@fitpulse/server-core'
import { afterEach, describe, expect, it } from 'vitest'
import { buildApp, type AppDeps } from '../src/app.js'
import { loadConfig } from '../src/config.js'

const env = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://fitpulse:fitpulse@localhost:5432/fitpulse_test',
  REDIS_URL: 'redis://localhost:6379',
  ADMIN_JWT_SECRET: 'admin-test-secret-at-least-32-characters',
}

const stubs = (ok: boolean) => {
  const result = () => (ok ? Promise.resolve([]) : Promise.reject(new Error('down')))
  return {
    prisma: { $queryRaw: result, $disconnect: async () => {} } as unknown as AppDeps['prisma'],
    redis: { ping: result, quit: async () => 'OK' } as unknown as AppDeps['redis'],
  }
}

let app: Awaited<ReturnType<typeof buildApp>>

afterEach(async () => {
  await app?.close()
})

describe('admin api', () => {
  it('health responds without the database', async () => {
    app = await buildApp({ config: loadConfig(env), ...stubs(false) })
    const res = await app.inject({ method: 'GET', url: '/api/health' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: 'ok' })
  })

  it('ready reports database and redis', async () => {
    app = await buildApp({ config: loadConfig(env), ...stubs(true) })
    const res = await app.inject({ method: 'GET', url: '/api/health/ready' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: 'ok', checks: { database: 'ok', redis: 'ok' } })
  })

  it('defaults to port 3001', () => {
    expect(loadConfig(env).PORT).toBe(3001)
  })

  it('uses ADMIN_JWT_SECRET, not JWT_SECRET', () => {
    const { ADMIN_JWT_SECRET: _omit, ...rest } = env
    const withAppSecretOnly = { ...rest, JWT_SECRET: 'test-secret-that-is-at-least-32-characters' }
    expect(() => loadConfig(withAppSecretOnly)).toThrow(ConfigError)
    expect(() => loadConfig(withAppSecretOnly)).toThrow(/ADMIN_JWT_SECRET/)
  })
})
