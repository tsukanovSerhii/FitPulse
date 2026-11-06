import { authResponseSchema, ErrorCode, loginRequestSchema, registerRequestSchema } from '@fitpulse/contracts'
import { Prisma } from '@fitpulse/db'
import {
  AuthError,
  clearRefreshCookie,
  hashPassword,
  rateLimit,
  readRefreshCookie,
  setRefreshCookie,
  verifyPassword,
} from '@fitpulse/server-core'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { AccessTokens, ApiConfig, Mailer, PrismaClient, Redis, SessionService, User } from '../deps.js'
import { toUserDto } from './users.js'

export const REFRESH_COOKIE = 'fp_refresh'

export interface AuthRouteDeps {
  config: ApiConfig
  prisma: PrismaClient
  redis: Redis
  sessions: SessionService
  tokens: AccessTokens
  mailer: Mailer
  now?: () => Date
}

const MINUTE = 60
const HOUR = 60 * MINUTE

export async function authRoutes(app: FastifyInstance, deps: AuthRouteDeps) {
  const { config, prisma, redis, sessions, tokens } = deps
  const api = app.withTypeProvider<ZodTypeProvider>()
  const secure = config.NODE_ENV === 'production'
  const limit = (key: string, max: number, windowSeconds: number) =>
    rateLimit(redis, { key, limit: max, windowSeconds, enabled: config.RATE_LIMIT_ENABLED, log: app.log })
  // Compared against when the email is unknown, so both answers take as long
  const dummyHash = hashPassword('timing-equaliser-not-a-real-password')

  async function signIn(request: FastifyRequest, reply: FastifyReply, user: User, remember: boolean) {
    const session = await sessions.start(user.id, { remember, userAgent: request.headers['user-agent']?.slice(0, 255) })
    setRefreshCookie(reply, REFRESH_COOKIE, session.refreshToken, { remember, secure })
    return { accessToken: await tokens.sign({ sub: user.id, sid: session.sessionId }), user: toUserDto(user) }
  }

  api.post(
    '/register',
    { schema: { body: registerRequestSchema, response: { 201: authResponseSchema } } },
    async (request, reply) => {
      await limit(`register:${request.ip}`, 5, HOUR)
      const { name, email, password, remember } = request.body
      let user: User
      try {
        user = await prisma.user.create({ data: { name, email, passwordHash: await hashPassword(password) } })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new AuthError(ErrorCode.EmailTaken)
        throw error
      }
      reply.status(201)
      return signIn(request, reply, user, remember)
    },
  )

  api.post('/login', { schema: { body: loginRequestSchema, response: { 200: authResponseSchema } } }, async (request, reply) => {
    const { email, password, remember } = request.body
    await limit(`login:${request.ip}:${email}`, 5, MINUTE)
    await limit(`login-ip:${request.ip}`, 20, MINUTE)
    const user = await prisma.user.findUnique({ where: { email } })
    const valid = await verifyPassword(user?.passwordHash ?? (await dummyHash), password)
    if (!user || !valid) throw new AuthError(ErrorCode.InvalidCredentials)
    if (user.blockedAt) throw new AuthError(ErrorCode.AccountBlocked)
    return signIn(request, reply, user, remember)
  })

  api.post(
    '/refresh',
    { schema: { body: z.object({}).optional(), response: { 200: authResponseSchema } } },
    async (request, reply) => {
      await limit(`refresh:${request.ip}`, 60, MINUTE)
      const token = readRefreshCookie(request, REFRESH_COOKIE)
      if (!token) throw new AuthError(ErrorCode.SessionExpired)
      let next: Awaited<ReturnType<SessionService['refresh']>>
      try {
        next = await sessions.refresh(token)
      } catch (error) {
        if (error instanceof AuthError && error.code === ErrorCode.SessionExpired) clearRefreshCookie(reply, REFRESH_COOKIE, secure)
        throw error
      }
      const user = await prisma.user.findUnique({ where: { id: next.accountId } })
      if (!user || user.blockedAt) {
        await sessions.revoke(next.sessionId)
        clearRefreshCookie(reply, REFRESH_COOKIE, secure)
        throw new AuthError(user ? ErrorCode.AccountBlocked : ErrorCode.SessionExpired)
      }
      setRefreshCookie(reply, REFRESH_COOKIE, next.refreshToken, { remember: next.remember, secure })
      return { accessToken: await tokens.sign({ sub: user.id, sid: next.sessionId }), user: toUserDto(user) }
    },
  )

  api.post('/logout', { schema: { body: z.object({}).optional() } }, async (request, reply) => {
    const token = readRefreshCookie(request, REFRESH_COOKIE)
    if (token) await sessions.revokeToken(token)
    clearRefreshCookie(reply, REFRESH_COOKIE, secure)
    return reply.status(204).send()
  })
}
