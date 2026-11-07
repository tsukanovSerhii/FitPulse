import { ErrorCode, errorResponseSchema, updateMeRequestSchema, userSchema, type ErrorResponse } from '@fitpulse/contracts'
import { Prisma } from '@fitpulse/db'
import { AuthError, authenticate, rateLimit, verifyPassword } from '@fitpulse/server-core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { toUserDto } from '../auth/users.js'
import type { AccessTokens, ApiConfig, PrismaClient, Redis } from '../deps.js'

export async function meRoutes(
  app: FastifyInstance,
  { config, prisma, redis, tokens }: { config: ApiConfig; prisma: PrismaClient; redis: Redis; tokens: AccessTokens },
) {
  const api = app.withTypeProvider<ZodTypeProvider>()
  api.addHook('onRequest', authenticate(tokens, redis, app.log))

  const currentUser = async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user || user.blockedAt) throw new AuthError(ErrorCode.Unauthorized)
    return user
  }

  api.get('/', { schema: { response: { 200: userSchema } } }, async (request) => toUserDto(await currentUser(request.auth!.accountId)))

  api.patch('/', { schema: { body: updateMeRequestSchema, response: { 200: userSchema, 400: errorResponseSchema } } }, async (request, reply) => {
    // Each change may hash a password and reveals whether an email is taken: a few a minute is plenty
    await rateLimit(redis, { key: `me-update:${request.auth!.accountId}`, limit: 10, windowSeconds: 60, enabled: config.RATE_LIMIT_ENABLED, log: app.log })
    const user = await currentUser(request.auth!.accountId)
    const { name, email, currentPassword } = request.body
    const emailChanges = email !== undefined && email !== user.email

    if (emailChanges) {
      if (!currentPassword) {
        const body: ErrorResponse = {
          error: {
            code: ErrorCode.Validation,
            message: 'Request validation failed',
            details: [{ path: 'currentPassword', message: 'Вкажіть поточний пароль, щоб змінити email' }],
          },
        }
        return reply.status(400).send(body)
      }
      if (!(await verifyPassword(user.passwordHash, currentPassword))) throw new AuthError(ErrorCode.InvalidCredentials)
    }

    try {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { ...(name !== undefined && { name }), ...(emailChanges && { email }) },
      })
      return toUserDto(updated)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new AuthError(ErrorCode.EmailTaken)
      throw error
    }
  })
}
