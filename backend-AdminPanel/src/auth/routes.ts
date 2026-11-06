import { adminAuthResponseSchema, adminUserSchema, ErrorCode, loginRequestSchema } from '@fitpulse/contracts'
import type { AdminUser, PrismaClient } from '@fitpulse/db'
import {
  AuthError,
  authenticate,
  clearRefreshCookie,
  hashPassword,
  rateLimit,
  readRefreshCookie,
  setRefreshCookie,
  verifyPassword,
  type AccessTokens,
  type Redis,
  type SessionService,
} from '@fitpulse/server-core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { AdminConfig } from '../config.js'
import { toAdminDto } from './admins.js'

export const ADMIN_REFRESH_COOKIE = 'fp_admin_refresh'

interface Deps {
  config: AdminConfig
  prisma: PrismaClient
  redis: Redis
  sessions: SessionService
  tokens: AccessTokens
}

const roleOf = (admin: AdminUser) => (admin.role === 'ADMIN' ? 'admin' : 'manager')

export async function adminAuthRoutes(app: FastifyInstance, { config, prisma, redis, sessions, tokens }: Deps) {
  const api = app.withTypeProvider<ZodTypeProvider>()
  const secure = config.NODE_ENV === 'production'
  const limit = (key: string, max: number) =>
    rateLimit(redis, { key, limit: max, windowSeconds: 60, enabled: config.RATE_LIMIT_ENABLED, log: app.log })
  const dummyHash = hashPassword('timing-equaliser-not-a-real-password')

  const respond = async (admin: AdminUser, sessionId: string) => ({
    accessToken: await tokens.sign({ sub: admin.id, sid: sessionId, role: roleOf(admin) }),
    user: toAdminDto(admin),
  })

  api.post('/login', { schema: { body: loginRequestSchema, response: { 200: adminAuthResponseSchema } } }, async (request, reply) => {
    const { email, password } = request.body
    await limit(`admin-login:${request.ip}:${email}`, 5)
    await limit(`admin-login-ip:${request.ip}`, 20)
    const admin = await prisma.adminUser.findUnique({ where: { email } })
    const valid = await verifyPassword(admin?.passwordHash ?? (await dummyHash), password)
    if (!admin || !valid) throw new AuthError(ErrorCode.InvalidCredentials)
    if (admin.disabledAt) throw new AuthError(ErrorCode.AccountDisabled)
    // Staff sessions always last 8 hours and end with the browser session
    const session = await sessions.start(admin.id, { remember: false, userAgent: request.headers['user-agent']?.slice(0, 255) })
    setRefreshCookie(reply, ADMIN_REFRESH_COOKIE, session.refreshToken, { remember: false, secure })
    return respond(admin, session.sessionId)
  })

  api.post('/refresh', { schema: { body: z.object({}).optional(), response: { 200: adminAuthResponseSchema } } }, async (request, reply) => {
    await limit(`admin-refresh:${request.ip}`, 60)
    const token = readRefreshCookie(request, ADMIN_REFRESH_COOKIE)
    if (!token) throw new AuthError(ErrorCode.SessionExpired)
    let next: Awaited<ReturnType<SessionService['refresh']>>
    try {
      next = await sessions.refresh(token)
    } catch (error) {
      if (error instanceof AuthError && error.code === ErrorCode.SessionExpired) clearRefreshCookie(reply, ADMIN_REFRESH_COOKIE, secure)
      throw error
    }
    const admin = await prisma.adminUser.findUnique({ where: { id: next.accountId } })
    if (!admin || admin.disabledAt) {
      await sessions.revoke(next.sessionId)
      clearRefreshCookie(reply, ADMIN_REFRESH_COOKIE, secure)
      throw new AuthError(admin ? ErrorCode.AccountDisabled : ErrorCode.SessionExpired)
    }
    setRefreshCookie(reply, ADMIN_REFRESH_COOKIE, next.refreshToken, { remember: false, secure })
    return respond(admin, next.sessionId)
  })

  api.post('/logout', { schema: { body: z.object({}).optional() } }, async (request, reply) => {
    const token = readRefreshCookie(request, ADMIN_REFRESH_COOKIE)
    if (token) await sessions.revokeToken(token)
    clearRefreshCookie(reply, ADMIN_REFRESH_COOKIE, secure)
    return reply.status(204).send()
  })
}

export async function adminMeRoutes(app: FastifyInstance, { prisma, redis, tokens }: Pick<Deps, 'prisma' | 'redis' | 'tokens'>) {
  const api = app.withTypeProvider<ZodTypeProvider>()
  api.addHook('preHandler', authenticate(tokens, redis, app.log))
  api.get('/', { schema: { response: { 200: adminUserSchema } } }, async (request) => {
    const admin = await prisma.adminUser.findUnique({ where: { id: request.auth!.accountId } })
    if (!admin || admin.disabledAt) throw new AuthError(ErrorCode.Unauthorized)
    return toAdminDto(admin)
  })
}
