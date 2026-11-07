import { ErrorCode, forgotPasswordRequestSchema, resetPasswordRequestSchema } from '@fitpulse/contracts'
import { AuthError, hashPassword, hashToken, newRefreshToken, rateLimit } from '@fitpulse/server-core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { resetPasswordEmail } from './emails.js'
import type { AuthRouteDeps } from './routes.js'

const RESET_TTL_MS = 60 * 60 * 1000
const HOUR = 60 * 60

export async function passwordResetRoutes(app: FastifyInstance, { config, prisma, redis, sessions, mailer, now = () => new Date() }: AuthRouteDeps) {
  const api = app.withTypeProvider<ZodTypeProvider>()
  const limit = (key: string, max: number) =>
    rateLimit(redis, { key, limit: max, windowSeconds: HOUR, enabled: config.RATE_LIMIT_ENABLED, log: app.log })

  // Always 204: the answer never tells whether the email has an account
  api.post('/forgot', { schema: { body: forgotPasswordRequestSchema } }, async (request, reply) => {
    const { email } = request.body
    await limit(`forgot-ip:${request.clientIp}`, 10)
    await limit(`forgot:${email}`, 3)
    // Keeps the mail quota for real requests even when addresses rotate
    await rateLimit(redis, { key: 'forgot-all', limit: 30, windowSeconds: 60, enabled: config.RATE_LIMIT_ENABLED, log: app.log })

    const user = await prisma.user.findUnique({ where: { email } })
    if (user && !user.blockedAt) {
      const token = newRefreshToken()
      const at = now()
      await prisma.$transaction([
        // Only the newest link works
        prisma.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: at } }),
        prisma.passwordResetToken.create({
          data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(at.getTime() + RESET_TTL_MS) },
        }),
      ])
      const link = `${config.APP_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`
      try {
        await mailer.send({ to: user.email, ...resetPasswordEmail({ name: user.name, link }) })
      } catch (err) {
        request.log.error({ err }, 'Password reset email was not sent')
      }
    }
    return reply.status(204).send()
  })

  api.post('/reset', { schema: { body: resetPasswordRequestSchema } }, async (request, reply) => {
    const { token, password } = request.body
    const at = now()
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } })
    if (!record || record.usedAt || record.expiresAt <= at) throw new AuthError(ErrorCode.ResetTokenInvalid)

    // Claim the token first, so two requests with the same link cannot both succeed
    const claimed = await prisma.passwordResetToken.updateMany({ where: { id: record.id, usedAt: null }, data: { usedAt: at } })
    if (claimed.count === 0) throw new AuthError(ErrorCode.ResetTokenInvalid)

    await prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(password) } })
    await sessions.revokeAll(record.userId)
    return reply.status(204).send()
  })
}
