import { createPrismaClient } from '@fitpulse/db'
import { createRedis, hashPassword } from '@fitpulse/server-core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'

let app: Awaited<ReturnType<typeof buildApp>>
let prisma: ReturnType<typeof createPrismaClient>
let token: string
let pendingId: string

const exercise = { name: 'Жим Арнольда', primaryMuscle: 'shoulders', muscleGroups: ['shoulders'], difficulty: 'beginner', equipment: 'dumbbell', description: '', defaultSets: 3, defaultReps: 10, defaultRestSeconds: 60 }
const call = (method: 'GET' | 'POST', url: string, payload?: unknown) =>
  app.inject({ method, url, headers: { authorization: `Bearer ${token}` }, ...(payload !== undefined && { payload }) })

beforeEach(async () => {
  const config = loadConfig({ ...process.env, NODE_ENV: 'test', ADMIN_JWT_SECRET: 'admin-test-secret-at-least-32-characters', RATE_LIMIT_ENABLED: 'false' })
  prisma = createPrismaClient(config.DATABASE_URL)
  const redis = createRedis(config.REDIS_URL)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "community_exercises", "admin_audit_log", "sessions", "users", "admin_sessions", "admin_users" CASCADE')
  app = await buildApp({ config, prisma, redis })
  await prisma.adminUser.create({ data: { email: 'help@fitpulse.app', passwordHash: await hashPassword('staff-password-123'), role: 'MANAGER' } })
  token = (await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'help@fitpulse.app', password: 'staff-password-123', remember: false } })).json().accessToken

  const ira = await prisma.user.create({ data: { email: 'ira@mail.com', name: 'Ira', passwordHash: 'x' } })
  pendingId = (await prisma.communityExercise.create({ data: { authorId: ira.id, data: exercise } })).id
  await prisma.communityExercise.create({ data: { authorId: ira.id, data: { ...exercise, name: 'Стара' }, status: 'APPROVED', reviewedAt: new Date() } })
  // Trainer exercises for students are not reviewed
  await prisma.communityExercise.create({ data: { authorId: ira.id, data: exercise, audience: 'students', status: 'APPROVED' } })
})
afterEach(() => app.close())

describe('exercise moderation', () => {
  it('the queue lists pending public submissions with their author', async () => {
    const res = await call('GET', '/api/moderation/exercises')
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.total).toBe(1)
    expect(body.items[0]).toMatchObject({ id: pendingId, status: 'pending', exercise: { name: 'Жим Арнольда' }, author: { name: 'Ira', email: 'ira@mail.com' } })
    expect((await call('GET', '/api/moderation/exercises?status=approved')).json().total).toBe(1)
  })

  it('a manager approves a submission, and it is logged', async () => {
    const res = await call('POST', `/api/moderation/exercises/${pendingId}/approve`, {})
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ status: 'approved', rejectReason: null })
    expect(res.json().reviewedAt).not.toBeNull()
    expect(await prisma.adminAuditLog.count({ where: { action: 'exercise.approve', targetId: pendingId } })).toBe(1)
  })

  it('a rejection needs a reason the author will see; an approved one can be hidden the same way', async () => {
    expect((await call('POST', `/api/moderation/exercises/${pendingId}/reject`, { reason: '' })).statusCode).toBe(400)
    const res = await call('POST', `/api/moderation/exercises/${pendingId}/reject`, { reason: 'Дублює вбудовану вправу' })
    expect(res.json()).toMatchObject({ status: 'rejected', rejectReason: 'Дублює вбудовану вправу' })
    expect(await prisma.adminAuditLog.count({ where: { action: 'exercise.reject' } })).toBe(1)

    await call('POST', `/api/moderation/exercises/${pendingId}/approve`, {})
    expect((await prisma.communityExercise.findUniqueOrThrow({ where: { id: pendingId } })).rejectReason).toBeNull()
  })

  it('an unknown or students-only exercise is not found', async () => {
    expect((await call('POST', '/api/moderation/exercises/00000000-0000-4000-8000-000000000000/approve', {})).statusCode).toBe(404)
    const own = await prisma.communityExercise.findFirstOrThrow({ where: { audience: 'students' } })
    expect((await call('POST', `/api/moderation/exercises/${own.id}/reject`, { reason: 'Ні' + 'ні' })).statusCode).toBe(404)
  })

  it('needs a staff session', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/moderation/exercises' })).statusCode).toBe(401)
  })
})
