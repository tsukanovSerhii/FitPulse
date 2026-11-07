import {
  communityCatalogSchema,
  communityExerciseSchema,
  ErrorCode,
  EXERCISE_LIMITS,
  exerciseSubmissionSchema,
  submitExerciseRequestSchema,
  type CommunityExercise,
} from '@fitpulse/contracts'
import type { CommunityExercise as Row } from '@fitpulse/db'
import { AuthError, authenticate } from '@fitpulse/server-core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { requireActiveUser } from '../auth/active-user.js'
import type { AccessTokens, PrismaClient, Redis } from '../deps.js'

const DAY = 24 * 60 * 60 * 1000

// Stored rows were validated on the way in; parsing again keeps a hand-edited row from reaching the app
const exerciseOf = (row: Row): CommunityExercise | null => {
  const parsed = communityExerciseSchema.safeParse(row.data)
  return parsed.success ? parsed.data : null
}

const submission = (row: Row) => ({
  id: row.id,
  status: row.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
  rejectReason: row.rejectReason,
  exercise: exerciseOf(row)!,
  createdAt: row.createdAt.toISOString(),
  reviewedAt: row.reviewedAt?.toISOString() ?? null,
})

/** Exercises users publish for everyone, after a staff member approves them. */
export async function exerciseRoutes(app: FastifyInstance, { prisma, redis, tokens }: { prisma: PrismaClient; redis: Redis; tokens: AccessTokens }) {
  const api = app.withTypeProvider<ZodTypeProvider>()
  api.addHook('onRequest', authenticate(tokens, redis, app.log))
  api.addHook('onRequest', requireActiveUser(prisma))

  api.post('/submissions', { schema: { body: submitExerciseRequestSchema, response: { 201: exerciseSubmissionSchema } } }, async (request, reply) => {
    const authorId = request.auth!.accountId
    // Counted in the database: the limit holds even when Redis is down
    const today = await prisma.communityExercise.count({ where: { authorId, createdAt: { gte: new Date(Date.now() - DAY) } } })
    if (today >= EXERCISE_LIMITS.submissionsPerDay) throw new AuthError(ErrorCode.RateLimited, { message: 'Не більше 5 заявок на добу', retryAfter: 3600 })
    const row = await prisma.communityExercise.create({ data: { authorId, data: request.body.exercise } })
    return reply.status(201).send(submission(row))
  })

  api.get('/submissions', { schema: { response: { 200: z.object({ items: z.array(exerciseSubmissionSchema) }) } } }, async (request) => {
    const rows = await prisma.communityExercise.findMany({
      where: { authorId: request.auth!.accountId, audience: 'public' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return { items: rows.filter((r) => exerciseOf(r)).map(submission) }
  })

  api.get('/community', { schema: { response: { 200: communityCatalogSchema } } }, async () => {
    const rows = await prisma.communityExercise.findMany({
      where: { status: 'APPROVED', audience: 'public' },
      orderBy: { reviewedAt: 'desc' },
      take: 500,
      include: { author: { select: { name: true } } },
    })
    return {
      items: rows.flatMap((row) => {
        const exercise = exerciseOf(row)
        return exercise ? [{ ...exercise, id: `community-${row.id}`, authorName: row.author.name }] : []
      }),
    }
  })
}
