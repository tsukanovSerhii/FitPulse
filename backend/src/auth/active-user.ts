import { ErrorCode } from '@fitpulse/contracts'
import { AuthError } from '@fitpulse/server-core'
import type { FastifyRequest } from 'fastify'
import type { PrismaClient } from '../deps.js'

/**
 * A blocked account keeps its access token for up to 15 minutes; this hook stops it at once.
 * Runs after `authenticate`.
 */
export const requireActiveUser = (prisma: PrismaClient) => async (request: FastifyRequest) => {
  const user = await prisma.user.findUnique({ where: { id: request.auth!.accountId }, select: { blockedAt: true } })
  if (!user) throw new AuthError(ErrorCode.Unauthorized)
  if (user.blockedAt) throw new AuthError(ErrorCode.AccountBlocked)
}
