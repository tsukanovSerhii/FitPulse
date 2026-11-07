import { createPrismaClient } from '@fitpulse/db'
import { createRedis, hashPassword } from '@fitpulse/server-core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'

const DAY = 24 * 60 * 60 * 1000
let app: Awaited<ReturnType<typeof buildApp>>
let prisma: ReturnType<typeof createPrismaClient>
let token: string
let iraId: string

const ago = (days: number) => new Date(Date.now() - days * DAY)
const dayAgo = (days: number) => new Date(ago(days).toISOString().slice(0, 10))
const get = (url: string) => app.inject({ method: 'GET', url, headers: { authorization: `Bearer ${token}` } })

beforeEach(async () => {
  const config = loadConfig({ ...process.env, NODE_ENV: 'test', ADMIN_JWT_SECRET: 'admin-test-secret-at-least-32-characters', RATE_LIMIT_ENABLED: 'false' })
  prisma = createPrismaClient(config.DATABASE_URL)
  const redis = createRedis(config.REDIS_URL)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "user_activity", "admin_audit_log", "sync_records", "sessions", "users", "admin_sessions", "admin_users" CASCADE')
  app = await buildApp({ config, prisma, redis })
  await prisma.adminUser.create({ data: { email: 'help@fitpulse.app', passwordHash: await hashPassword('staff-password-123'), role: 'MANAGER' } })
  token = (await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'help@fitpulse.app', password: 'staff-password-123', remember: false } })).json().accessToken

  const ira = await prisma.user.create({ data: { email: 'ira@mail.com', name: 'Ira', passwordHash: 'x', createdAt: ago(10) } })
  const bob = await prisma.user.create({ data: { email: 'bob@mail.com', name: 'Bob', passwordHash: 'x', createdAt: ago(2) } })
  await prisma.user.create({ data: { email: 'old@mail.com', name: 'Old', passwordHash: 'x', createdAt: ago(40) } })
  iraId = ira.id
  const session = (userId: string, info: Record<string, unknown>, daysAgo: number) =>
    prisma.session.create({ data: { userId, refreshTokenHash: `h-${userId}-${daysAgo}`, expiresAt: new Date(Date.now() + DAY), createdAt: ago(daysAgo), lastSeenAt: ago(daysAgo), ...info } })
  await session(ira.id, { deviceType: 'desktop', os: 'Windows', browser: 'Chrome', appMode: 'browser', country: 'PL', city: 'Warsaw', ipPrefix: '5.6.7.x' }, 20)
  await session(ira.id, { deviceType: 'mobile', os: 'iOS', browser: 'Safari', appMode: 'installed', country: 'UA', city: 'Kyiv', ipPrefix: '93.75.12.x' }, 1)
  await session(bob.id, { deviceType: 'mobile', os: 'Android', browser: 'Chrome', appMode: 'browser', country: 'UA', city: 'Lviv', ipPrefix: '46.1.2.x' }, 1)
  await prisma.userActivity.createMany({
    data: [
      { userId: ira.id, day: dayAgo(1), minutes: 30 },
      { userId: ira.id, day: dayAgo(3), minutes: 10 },
      { userId: bob.id, day: dayAgo(1), minutes: 20 },
      { userId: ira.id, day: dayAgo(50), minutes: 99 },
    ],
  })
  const workout = (id: string, daysAgo: number) => ({ userId: ira.id, kind: 'workout', recordId: id, data: { id, date: ago(daysAgo).toISOString() }, updatedAt: ago(daysAgo) })
  await prisma.syncRecord.createMany({ data: [workout('w1', 1), workout('w2', 3), workout('w3', 60)] })
})
afterEach(() => app.close())

describe('analytics', () => {
  it('overview has one point per day and totals with the previous period', async () => {
    const res = await get('/api/analytics/overview?days=7')
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.series).toHaveLength(7)
    expect(body.current).toEqual({ signups: 1, activeUsers: 2, workouts: 2, minutesPerActive: 30 })
    expect(body.previous.signups).toBe(1)
    const yesterday = body.series.find((p: { day: string }) => p.day === dayAgo(1).toISOString().slice(0, 10))
    expect(yesterday).toMatchObject({ active: 2, workouts: 1, minutes: 50 })
    // Ira signed up 10 days ago and was active this week
    expect(body.retention).toBe(1)
  })

  it('only 7, 30 or 90 days are allowed', async () => {
    expect((await get('/api/analytics/overview?days=365')).statusCode).toBe(400)
  })

  it('devices count each user once, by their latest sign-in', async () => {
    const body = (await get('/api/analytics/devices?days=30')).json()
    expect(body.deviceTypes).toEqual([{ name: 'mobile', count: 2 }])
    expect(body.os).toEqual(expect.arrayContaining([{ name: 'iOS', count: 1 }, { name: 'Android', count: 1 }]))
    expect(body.appModes).toEqual(expect.arrayContaining([{ name: 'installed', count: 1 }, { name: 'browser', count: 1 }]))
  })

  it('geo lists countries and cities by users', async () => {
    const body = (await get('/api/analytics/geo?days=30')).json()
    expect(body.countries).toEqual([{ name: 'UA', count: 2 }])
    expect(body.cities).toEqual(expect.arrayContaining([{ name: 'Kyiv', country: 'UA', count: 1 }, { name: 'Lviv', country: 'UA', count: 1 }]))
  })

  it('the user card shows minutes, daily activity and sessions with truncated addresses', async () => {
    const body = (await get(`/api/users/${iraId}`)).json()
    expect(body).toMatchObject({ minutes7d: 40, minutes30d: 40, country: 'UA' })
    expect(body.activity).toHaveLength(30)
    expect(body.sessions[0]).toMatchObject({ deviceType: 'mobile', city: 'Kyiv', ipPrefix: '93.75.12.x', active: true })
    expect(body.sessions).toHaveLength(2)
  })

  it('the user list shows the country of the last sign-in', async () => {
    const items = (await get('/api/users')).json().items
    expect(items.find((u: { email: string }) => u.email === 'bob@mail.com').country).toBe('UA')
  })
})
