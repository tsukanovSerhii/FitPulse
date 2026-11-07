import { adminAuthResponseSchema } from '@fitpulse/contracts'
import { createPrismaClient } from '@fitpulse/db'
import { createAccessTokens, createRedis, hashPassword } from '@fitpulse/server-core'
import type { LightMyRequestResponse } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'

const PASSWORD = 'staff-password'
let app: Awaited<ReturnType<typeof buildApp>>
let prisma: ReturnType<typeof createPrismaClient>
let clock: Date | null

async function setup() {
  const config = loadConfig({ ...process.env, NODE_ENV: 'test', ADMIN_JWT_SECRET: 'admin-test-secret-at-least-32-characters', RATE_LIMIT_ENABLED: 'false' })
  prisma = createPrismaClient(config.DATABASE_URL)
  const redis = createRedis(config.REDIS_URL)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "admin_sessions", "admin_users" CASCADE')
  await redis.flushdb().catch(() => undefined)
  clock = null
  app = await buildApp({ config, prisma, redis, now: () => clock ?? new Date() })
  const passwordHash = await hashPassword(PASSWORD)
  await prisma.adminUser.createMany({
    data: [
      { email: 'boss@fitpulse.app', passwordHash, role: 'ADMIN' },
      { email: 'help@fitpulse.app', passwordHash, role: 'MANAGER' },
      { email: 'gone@fitpulse.app', passwordHash, role: 'MANAGER', disabledAt: new Date() },
    ],
  })
}

const login = (email: string, password = PASSWORD) =>
  app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password, remember: false } })
const cookie = (res: LightMyRequestResponse) => res.cookies.find((c) => c.name === 'fp_admin_refresh')
const refresh = (token: string) => app.inject({ method: 'POST', url: '/api/auth/refresh', payload: {}, cookies: { fp_admin_refresh: token } })
const me = (token: string) => app.inject({ method: 'GET', url: '/api/me', headers: { authorization: `Bearer ${token}` } })

beforeEach(setup)
afterEach(() => app.close())

describe('admin auth', () => {
  it('admin and manager sign in with their role in the token', async () => {
    const admin = adminAuthResponseSchema.parse((await login('boss@fitpulse.app')).json())
    expect(admin.user.role).toBe('admin')
    expect((await me(admin.accessToken)).json()).toMatchObject({ email: 'boss@fitpulse.app', role: 'admin' })

    const manager = adminAuthResponseSchema.parse((await login('Help@FitPulse.app')).json())
    expect(manager.user.role).toBe('manager')
  })

  it('wrong password is INVALID_CREDENTIALS', async () => {
    const res = await login('boss@fitpulse.app', 'wrong-password')
    expect(res.statusCode).toBe(401)
    expect(res.json().error.code).toBe('INVALID_CREDENTIALS')
  })

  it('disabled admin is ACCOUNT_DISABLED', async () => {
    const res = await login('gone@fitpulse.app')
    expect(res.statusCode).toBe(403)
    expect(res.json().error.code).toBe('ACCOUNT_DISABLED')
  })

  it('admin session is not extended by refresh', async () => {
    const res = await login('boss@fitpulse.app')
    const before = (await prisma.adminSession.findFirstOrThrow()).expiresAt
    clock = new Date(Date.now() + 60 * 60 * 1000)
    const next = await refresh(cookie(res)!.value)
    expect(next.statusCode).toBe(200)
    expect(cookie(next)!.name).toBe('fp_admin_refresh')
    expect((await prisma.adminSession.findFirstOrThrow()).expiresAt).toEqual(before)
  })

  it('app access token is rejected by the admin API', async () => {
    const appToken = await createAccessTokens('test-secret-that-is-at-least-32-characters').sign({ sub: 'u1', sid: 's1' })
    expect((await me(appToken)).statusCode).toBe(401)
  })

  it('logout revokes the admin session', async () => {
    const res = await login('boss@fitpulse.app')
    const token = cookie(res)!.value
    const { accessToken } = res.json()
    const out = await app.inject({ method: 'POST', url: '/api/auth/logout', payload: {}, cookies: { fp_admin_refresh: token } })
    expect(out.statusCode).toBe(204)
    expect((await refresh(token)).statusCode).toBe(401)
    expect((await me(accessToken)).statusCode).toBe(401)
  })
})
