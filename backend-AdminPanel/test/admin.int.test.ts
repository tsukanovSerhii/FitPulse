import { createPrismaClient } from '@fitpulse/db'
import { createAccessTokens, createRedis, hashPassword } from '@fitpulse/server-core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'

const PASSWORD = 'staff-password-123'
let app: Awaited<ReturnType<typeof buildApp>>
let prisma: ReturnType<typeof createPrismaClient>
let redis: ReturnType<typeof createRedis>
let adminToken: string
let managerToken: string
let adminId: string

const DAY = 24 * 60 * 60 * 1000
const as = (token: string) => ({ authorization: `Bearer ${token}` })
const call = (method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, token: string, payload?: Record<string, unknown>) =>
  app.inject({ method, url, headers: as(token), ...(payload && { payload }) })

async function signIn(email: string) {
  const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password: PASSWORD, remember: false } })
  return res.json().accessToken as string
}

beforeEach(async () => {
  const config = loadConfig({ ...process.env, NODE_ENV: 'test', ADMIN_JWT_SECRET: 'admin-test-secret-at-least-32-characters', RATE_LIMIT_ENABLED: 'false' })
  prisma = createPrismaClient(config.DATABASE_URL)
  redis = createRedis(config.REDIS_URL)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "user_activity", "admin_audit_log", "sync_records", "sessions", "users", "admin_sessions", "admin_users" CASCADE')
  await redis.flushdb().catch(() => undefined)
  app = await buildApp({ config, prisma, redis })
  const passwordHash = await hashPassword(PASSWORD)
  adminId = (await prisma.adminUser.create({ data: { email: 'boss@fitpulse.app', passwordHash, role: 'ADMIN' } })).id
  await prisma.adminUser.create({ data: { email: 'help@fitpulse.app', passwordHash, role: 'MANAGER' } })
  adminToken = await signIn('boss@fitpulse.app')
  managerToken = await signIn('help@fitpulse.app')

  const now = Date.now()
  const user = (email: string, name: string, daysAgo: number, extra: Record<string, unknown> = {}) =>
    prisma.user.create({ data: { email, name, passwordHash: 'x', createdAt: new Date(now - daysAgo * DAY), ...extra } })
  const ira = await user('ira@mail.com', 'Ірина', 2, { plan: 'PRO' })
  await user('bob@mail.com', 'Bob', 20)
  await user('old@mail.com', 'Old', 90, { blockedAt: new Date() })
  await prisma.syncRecord.createMany({
    data: [
      { userId: ira.id, kind: 'workout', recordId: 'w1', data: {}, updatedAt: new Date(now - DAY) },
      { userId: ira.id, kind: 'workout', recordId: 'w2', data: {}, updatedAt: new Date(now - 10 * DAY) },
      { userId: ira.id, kind: 'body', recordId: 'b1', data: {}, updatedAt: new Date(now - DAY) },
    ],
  })
})
afterEach(() => app.close())

const userId = async (email: string) => (await prisma.user.findUniqueOrThrow({ where: { email } })).id

describe('stats and users', () => {
  it('stats count users, activity, workouts, Pro and blocked accounts', async () => {
    const res = await call('GET', '/api/stats', managerToken)
    expect(res.json()).toEqual({ users: 3, newUsers7d: 1, newUsers30d: 2, activeUsers7d: 1, workouts: 2, workouts7d: 1, proUsers: 1, blockedUsers: 1 })
  })

  it('search finds by part of the email or the name, newest first, with status filter', async () => {
    expect((await call('GET', '/api/users?query=IRA', managerToken)).json().items.map((u: { email: string }) => u.email)).toEqual(['ira@mail.com'])
    expect((await call('GET', `/api/users?query=${encodeURIComponent('рина')}`, managerToken)).json().total).toBe(1)
    const all = (await call('GET', '/api/users', managerToken)).json()
    expect(all.items.map((u: { email: string }) => u.email)).toEqual(['ira@mail.com', 'bob@mail.com', 'old@mail.com'])
    expect((await call('GET', '/api/users?status=blocked', managerToken)).json().total).toBe(1)
  })

  it('the user card shows workouts, body entries and the last sync', async () => {
    const res = await call('GET', `/api/users/${await userId('ira@mail.com')}`, managerToken)
    expect(res.json()).toMatchObject({ email: 'ira@mail.com', plan: 'pro', workouts: 2, bodyEntries: 1, activeSessions: 0 })
    expect(res.json().lastSyncAt).not.toBeNull()
    expect((await call('GET', '/api/users/00000000-0000-4000-8000-000000000000', managerToken)).statusCode).toBe(404)
  })
})

describe('actions', () => {
  it('blocking revokes the sessions and stops their access tokens at once', async () => {
    const id = await userId('bob@mail.com')
    const session = await prisma.session.create({ data: { userId: id, refreshTokenHash: 'h-bob', expiresAt: new Date(Date.now() + DAY) } })
    const res = await call('POST', `/api/users/${id}/block`, managerToken)
    expect(res.statusCode).toBe(200)
    expect(res.json().blockedAt).not.toBeNull()
    expect((await prisma.session.findUniqueOrThrow({ where: { id: session.id } })).revokedAt).not.toBeNull()
    expect((await call('POST', `/api/users/${id}/unblock`, managerToken)).json().blockedAt).toBeNull()
  })

  it('a manager cannot change plans, delete users or manage staff', async () => {
    const id = await userId('bob@mail.com')
    expect((await call('PATCH', `/api/users/${id}`, managerToken, { plan: 'pro' })).statusCode).toBe(403)
    expect((await call('DELETE', `/api/users/${id}`, managerToken)).statusCode).toBe(403)
    const staff = await call('GET', '/api/staff', managerToken)
    expect(staff.statusCode).toBe(403)
    expect(staff.json().error.code).toBe('FORBIDDEN')
  })

  it('an admin changes the plan and deletes a user with all data', async () => {
    const id = await userId('ira@mail.com')
    expect((await call('PATCH', `/api/users/${id}`, adminToken, { plan: 'free' })).json().plan).toBe('free')
    expect((await call('DELETE', `/api/users/${id}`, adminToken)).statusCode).toBe(204)
    expect(await prisma.syncRecord.count({ where: { userId: id } })).toBe(0)
  })

  it('a demoted admin loses admin rights at once, without a new token', async () => {
    await prisma.adminUser.update({ where: { id: adminId }, data: { role: 'MANAGER' } })
    expect((await call('GET', '/api/staff', adminToken)).statusCode).toBe(403)
  })

  it('a token signed for the app is not accepted', async () => {
    const appToken = await createAccessTokens('test-secret-that-is-at-least-32-characters').sign({ sub: adminId, sid: 's1' })
    expect((await call('GET', '/api/stats', appToken)).statusCode).toBe(401)
  })
})

describe('staff and audit', () => {
  it('an admin creates a manager who can sign in, and disabling ends their access', async () => {
    const created = await call('POST', '/api/staff', adminToken, { email: 'New@FitPulse.app', password: 'a-long-password', role: 'manager' })
    expect(created.statusCode).toBe(201)
    expect(created.json()).toMatchObject({ email: 'new@fitpulse.app', role: 'manager', disabledAt: null })
    const login = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'new@fitpulse.app', password: 'a-long-password', remember: false } })
    expect(login.statusCode).toBe(200)
    const off = await call('PATCH', `/api/staff/${created.json().id}`, adminToken, { disabled: true })
    expect(off.json().disabledAt).not.toBeNull()
    expect((await call('GET', '/api/stats', login.json().accessToken)).statusCode).toBe(401)
  })

  it('short staff passwords and duplicate emails are refused', async () => {
    expect((await call('POST', '/api/staff', adminToken, { email: 'x@fitpulse.app', password: 'short', role: 'manager' })).statusCode).toBe(400)
    expect((await call('POST', '/api/staff', adminToken, { email: 'help@fitpulse.app', password: 'a-long-password', role: 'manager' })).statusCode).toBe(409)
  })

  it('an admin cannot disable or demote themselves', async () => {
    expect((await call('PATCH', `/api/staff/${adminId}`, adminToken, { disabled: true })).statusCode).toBe(400)
    expect((await call('PATCH', `/api/staff/${adminId}`, adminToken, { role: 'manager' })).statusCode).toBe(400)
  })

  it('every change is in the audit log; a manager sees only their own entries', async () => {
    const bob = await userId('bob@mail.com')
    await call('POST', `/api/users/${bob}/block`, managerToken)
    await call('PATCH', `/api/users/${bob}`, adminToken, { plan: 'pro' })
    const all = (await call('GET', '/api/audit', adminToken)).json().items
    expect(all.map((e: { action: string }) => e.action)).toEqual(['user.plan', 'user.block'])
    expect(all[1]).toMatchObject({ adminEmail: 'help@fitpulse.app', targetId: bob })
    const own = (await call('GET', '/api/audit', managerToken)).json().items
    expect(own.map((e: { action: string }) => e.action)).toEqual(['user.block'])
  })
})
