import { authenticate } from '@fitpulse/server-core'
import type { FastifyInstance } from 'fastify'
import type { AccessTokens, PrismaClient, Redis } from '../deps.js'

/** One visible minute in the app, sent by the app every 60 s while the tab is in front. */
export async function activityRoutes(app: FastifyInstance, { prisma, redis, tokens }: { prisma: PrismaClient; redis: Redis; tokens: AccessTokens }) {
  app.addHook('onRequest', authenticate(tokens, redis, app.log))
  app.post('/', async (request, reply) => {
    const userId = request.auth!.accountId
    // A minute counts once even if two tabs or a retry send it
    let first = true
    try {
      first = (await redis.set(`activity:${userId}`, '1', 'EX', 50, 'NX')) === 'OK'
    } catch (err) {
      app.log.warn({ err }, 'Activity de-duplication skipped: Redis unavailable')
    }
    if (first) {
      const day = new Date().toISOString().slice(0, 10)
      await prisma.$executeRaw`
        INSERT INTO user_activity (user_id, day, minutes) VALUES (${userId}::uuid, ${day}::date, 1)
        ON CONFLICT (user_id, day) DO UPDATE SET minutes = user_activity.minutes + 1`
    }
    return reply.status(204).send()
  })
}
