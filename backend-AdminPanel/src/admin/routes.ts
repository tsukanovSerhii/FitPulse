import {
  adminStatsSchema,
  adminUserDetailSchema,
  adminUserRowSchema,
  auditPageSchema,
  createStaffRequestSchema,
  ErrorCode,
  errorResponseSchema,
  staffMemberSchema,
  updateStaffRequestSchema,
  updateUserRequestSchema,
  userListQuerySchema,
  userListSchema,
  type ErrorResponse,
} from '@fitpulse/contracts'
import { Prisma, type AdminUser, type PrismaClient, type User } from '@fitpulse/db'
import { AuthError, authenticate, hashPassword, REVOKED_TTL_SECONDS, revokedKey, type AccessTokens, type Redis } from '@fitpulse/server-core'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { analyticsRoutes, userActivity } from './analytics.js'
import { moderationRoutes } from './moderation.js'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

declare module 'fastify' {
  interface FastifyRequest {
    staff?: AdminUser
  }
}

interface Deps {
  prisma: PrismaClient
  redis: Redis
  tokens: AccessTokens
}

const PAGE_SIZE = 20
const AUDIT_PAGE = 50
const DAY = 24 * 60 * 60 * 1000
const idParams = z.object({ id: z.string().uuid() })

const userRow = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  plan: user.plan === 'PRO' ? ('pro' as const) : ('free' as const),
  createdAt: user.createdAt.toISOString(),
  blockedAt: user.blockedAt?.toISOString() ?? null,
})

const staffRow = (admin: AdminUser) => ({
  id: admin.id,
  email: admin.email,
  role: admin.role === 'ADMIN' ? ('admin' as const) : ('manager' as const),
  createdAt: admin.createdAt.toISOString(),
  disabledAt: admin.disabledAt?.toISOString() ?? null,
})

const badRequest = (reply: FastifyReply, path: string, message: string) => {
  const body: ErrorResponse = { error: { code: ErrorCode.Validation, message: 'Request validation failed', details: [{ path, message }] } }
  return reply.status(400).send(body as never)
}

const notFound = (reply: FastifyReply) => reply.status(404).send({ error: { code: ErrorCode.NotFound, message: 'Не знайдено' } } as never)

export async function adminRoutes(app: FastifyInstance, { prisma, redis, tokens }: Deps) {
  const api = app.withTypeProvider<ZodTypeProvider>()
  api.addHook('onRequest', authenticate(tokens, redis, app.log))
  // The role is read from the database on every request, so a demotion or a disabled account applies at once
  api.addHook('onRequest', async (request: FastifyRequest) => {
    const staff = await prisma.adminUser.findUnique({ where: { id: request.auth!.accountId } })
    if (!staff || staff.disabledAt) throw new AuthError(ErrorCode.Unauthorized)
    request.staff = staff
  })
  const adminOnly = async (request: FastifyRequest) => {
    if (request.staff!.role !== 'ADMIN') throw new AuthError(ErrorCode.Forbidden)
  }

  const audit = (request: FastifyRequest, action: string, targetId: string, details?: Prisma.InputJsonValue) =>
    prisma.adminAuditLog.create({ data: { adminId: request.staff!.id, action, targetId, ...(details !== undefined && { details }) } })

  async function markRevoked(sessionIds: string[]) {
    await Promise.allSettled(sessionIds.map((id) => redis.set(revokedKey(id), '1', 'EX', REVOKED_TTL_SECONDS)))
  }

  analyticsRoutes(app, prisma)
  moderationRoutes(app, prisma, audit)

  // --- Stats and users ----------------------------------------------------------------------

  api.get('/stats', { schema: { response: { 200: adminStatsSchema } } }, async () => {
    const now = Date.now()
    const week = new Date(now - 7 * DAY)
    const month = new Date(now - 30 * DAY)
    const [users, newUsers7d, newUsers30d, proUsers, blockedUsers, workouts, workouts7d, active] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: week } } }),
      prisma.user.count({ where: { createdAt: { gte: month } } }),
      prisma.user.count({ where: { plan: 'PRO' } }),
      prisma.user.count({ where: { blockedAt: { not: null } } }),
      prisma.syncRecord.count({ where: { kind: 'workout', deletedAt: null } }),
      prisma.syncRecord.count({ where: { kind: 'workout', deletedAt: null, updatedAt: { gte: week } } }),
      prisma.$queryRaw<{ n: bigint }[]>`SELECT count(DISTINCT user_id) AS n FROM sync_records WHERE updated_at >= ${week}`,
    ])
    return { users, newUsers7d, newUsers30d, activeUsers7d: Number(active[0]?.n ?? 0), workouts, workouts7d, proUsers, blockedUsers }
  })

  api.get('/users', { schema: { querystring: userListQuerySchema, response: { 200: userListSchema } } }, async (request) => {
    const { query, status, page } = request.query
    const where: Prisma.UserWhereInput = {
      ...(query && { OR: [{ email: { contains: query, mode: 'insensitive' } }, { name: { contains: query, mode: 'insensitive' } }] }),
      ...(status === 'blocked' && { blockedAt: { not: null } }),
      ...(status === 'active' && { blockedAt: null }),
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { sessions: { orderBy: { createdAt: 'desc' }, take: 1, select: { country: true } } },
      }),
      prisma.user.count({ where }),
    ])
    return { items: items.map((u) => ({ ...userRow(u), country: u.sessions[0]?.country ?? null })), total, page, pageSize: PAGE_SIZE }
  })

  api.get('/users/:id', { schema: { params: idParams, response: { 200: adminUserDetailSchema, 404: errorResponseSchema } } }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.params.id } })
    if (!user) return notFound(reply)
    const [workouts, bodyEntries, last, activeSessions] = await Promise.all([
      prisma.syncRecord.count({ where: { userId: user.id, kind: 'workout', deletedAt: null } }),
      prisma.syncRecord.count({ where: { userId: user.id, kind: 'body', deletedAt: null } }),
      prisma.syncRecord.aggregate({ where: { userId: user.id }, _max: { updatedAt: true } }),
      prisma.session.count({ where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } } }),
    ])
    return { ...userRow(user), workouts, bodyEntries, lastSyncAt: last._max.updatedAt?.toISOString() ?? null, activeSessions, ...(await userActivity(prisma, user.id)) }
  })

  api.post('/users/:id/block', { schema: { params: idParams, response: { 200: adminUserRowSchema, 404: errorResponseSchema } } }, async (request, reply) => {
    const { id } = request.params
    if (!(await prisma.user.findUnique({ where: { id } }))) return notFound(reply)
    const active = await prisma.session.findMany({ where: { userId: id, revokedAt: null }, select: { id: true } })
    const at = new Date()
    const [user] = await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { blockedAt: at } }),
      prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: at } }),
      audit(request, 'user.block', id, { sessions: active.length }),
    ])
    // Access tokens of these sessions stop at once, not when they expire
    await markRevoked(active.map((s) => s.id))
    return userRow(user)
  })

  api.post('/users/:id/unblock', { schema: { params: idParams, response: { 200: adminUserRowSchema, 404: errorResponseSchema } } }, async (request, reply) => {
    const { id } = request.params
    if (!(await prisma.user.findUnique({ where: { id } }))) return notFound(reply)
    const [user] = await prisma.$transaction([prisma.user.update({ where: { id }, data: { blockedAt: null } }), audit(request, 'user.unblock', id)])
    return userRow(user)
  })

  api.patch(
    '/users/:id',
    { preHandler: adminOnly, schema: { params: idParams, body: updateUserRequestSchema, response: { 200: adminUserRowSchema, 404: errorResponseSchema } } },
    async (request, reply) => {
      const { id } = request.params
      const before = await prisma.user.findUnique({ where: { id } })
      if (!before) return notFound(reply)
      const plan = request.body.plan === 'pro' ? 'PRO' : 'FREE'
      const [user] = await prisma.$transaction([
        prisma.user.update({ where: { id }, data: { plan } }),
        audit(request, 'user.plan', id, { from: before.plan.toLowerCase(), to: request.body.plan }),
      ])
      return userRow(user)
    },
  )

  api.delete('/users/:id', { preHandler: adminOnly, schema: { params: idParams, response: { 204: z.null(), 404: errorResponseSchema } } }, async (request, reply) => {
    const { id } = request.params
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return notFound(reply)
    const active = await prisma.session.findMany({ where: { userId: id, revokedAt: null }, select: { id: true } })
    // Sessions, reset links and synced data go with the account (cascade)
    // Only the id: the deleted person's email must not outlive their account
    await prisma.$transaction([prisma.user.delete({ where: { id } }), audit(request, 'user.delete', id)])
    await markRevoked(active.map((s) => s.id))
    return reply.status(204).send(null)
  })

  // --- Staff --------------------------------------------------------------------------------

  api.get('/staff', { preHandler: adminOnly, schema: { response: { 200: z.array(staffMemberSchema) } } }, async () =>
    (await prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } })).map(staffRow),
  )

  api.post(
    '/staff',
    { preHandler: adminOnly, schema: { body: createStaffRequestSchema, response: { 201: staffMemberSchema, 409: errorResponseSchema } } },
    async (request, reply) => {
      const { email, password, role } = request.body
      try {
        const passwordHash = await hashPassword(password)
        const [created] = await prisma.$transaction(async (tx) => {
          const admin = await tx.adminUser.create({ data: { email, passwordHash, role: role === 'admin' ? 'ADMIN' : 'MANAGER' } })
          await tx.adminAuditLog.create({ data: { adminId: request.staff!.id, action: 'staff.create', targetId: admin.id, details: { email, role } } })
          return [admin]
        })
        return reply.status(201).send(staffRow(created))
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new AuthError(ErrorCode.EmailTaken)
        throw error
      }
    },
  )

  api.patch(
    '/staff/:id',
    { preHandler: adminOnly, schema: { params: idParams, body: updateStaffRequestSchema, response: { 200: staffMemberSchema, 404: errorResponseSchema } } },
    async (request, reply) => {
      const { id } = request.params
      const { role, disabled } = request.body
      // Keeps at least the acting admin able to manage the panel
      if (id === request.staff!.id && (disabled === true || role === 'manager')) return badRequest(reply, 'id', 'Не можна вимкнути або понизити себе')
      const target = await prisma.adminUser.findUnique({ where: { id } })
      if (!target) return notFound(reply)
      const data = {
        ...(role && { role: role === 'admin' ? ('ADMIN' as const) : ('MANAGER' as const) }),
        ...(disabled !== undefined && { disabledAt: disabled ? new Date() : null }),
      }
      const active = disabled ? await prisma.adminSession.findMany({ where: { adminId: id, revokedAt: null }, select: { id: true } }) : []
      const [updated] = await prisma.$transaction([
        prisma.adminUser.update({ where: { id }, data }),
        prisma.adminSession.updateMany({ where: { adminId: id, revokedAt: null, ...(disabled ? {} : { id: '__none__' }) }, data: { revokedAt: new Date() } }),
        audit(request, 'staff.update', id, { ...(role && { role }), ...(disabled !== undefined && { disabled }) }),
      ])
      await markRevoked(active.map((s) => s.id))
      return staffRow(updated)
    },
  )

  // --- Audit --------------------------------------------------------------------------------

  api.get('/audit', { schema: { querystring: z.object({ page: z.coerce.number().int().min(1).max(10_000).default(1) }), response: { 200: auditPageSchema } } }, async (request) => {
    const { page } = request.query
    const own = request.staff!.role !== 'ADMIN'
    const rows = await prisma.adminAuditLog.findMany({
      where: own ? { adminId: request.staff!.id } : {},
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * AUDIT_PAGE,
      take: AUDIT_PAGE + 1,
      include: { admin: { select: { email: true } } },
    })
    return {
      page,
      hasMore: rows.length > AUDIT_PAGE,
      items: rows.slice(0, AUDIT_PAGE).map((row) => ({
        id: row.id,
        adminEmail: row.admin?.email ?? null,
        action: row.action,
        targetId: row.targetId,
        details: row.details,
        createdAt: row.createdAt.toISOString(),
      })),
    }
  })
}
