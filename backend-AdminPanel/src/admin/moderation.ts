import { communityExerciseSchema, errorResponseSchema, ErrorCode, moderationItemSchema, moderationPageSchema, moderationQuerySchema, rejectExerciseRequestSchema } from '@fitpulse/contracts'
import type { CommunityExercise, Prisma, PrismaClient, User } from '@fitpulse/db'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const PAGE_SIZE = 20
const idParams = z.object({ id: z.string().uuid() })

type Audit = (request: FastifyRequest, action: string, targetId: string, details?: Prisma.InputJsonValue) => Prisma.PrismaPromise<unknown>

const item = (row: CommunityExercise & { author: Pick<User, 'id' | 'name' | 'email'> }) => {
  const parsed = communityExerciseSchema.safeParse(row.data)
  return {
    id: row.id,
    status: row.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
    rejectReason: row.rejectReason,
    // A row that no longer matches the format shows as an empty draft the staff can reject
    exercise: parsed.success
      ? parsed.data
      : { name: '(пошкоджені дані)', primaryMuscle: 'chest' as const, muscleGroups: ['chest' as const], difficulty: 'beginner' as const, equipment: 'bodyweight' as const, description: '', defaultSets: 1, defaultReps: 1, defaultRestSeconds: 10 },
    author: row.author,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  }
}

const author = { select: { id: true, name: true, email: true } } as const

/** The queue of exercises users want to publish for everyone. Managers and admins review it. */
export function moderationRoutes(app: FastifyInstance, prisma: PrismaClient, audit: Audit) {
  const api = app.withTypeProvider<ZodTypeProvider>()
  // Trainer exercises for their own students are not reviewed
  const reviewable = { audience: 'public' }

  api.get('/moderation/exercises', { schema: { querystring: moderationQuerySchema, response: { 200: moderationPageSchema } } }, async (request) => {
    const { status, page } = request.query
    const where = { ...reviewable, status: status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED' }
    const [rows, total] = await Promise.all([
      prisma.communityExercise.findMany({
        where,
        // The oldest request is answered first; reviewed ones show the latest decision first
        orderBy: status === 'pending' ? { createdAt: 'asc' } : { reviewedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { author },
      }),
      prisma.communityExercise.count({ where }),
    ])
    return { items: rows.map(item), total, page, pageSize: PAGE_SIZE }
  })

  const decide = (action: 'approve' | 'reject') =>
    async (request: FastifyRequest<{ Params: { id: string }; Body: { reason?: string } }>, reply: { status: (code: number) => { send: (body: never) => unknown } }) => {
      const { id } = request.params
      const found = await prisma.communityExercise.findFirst({ where: { id, ...reviewable } })
      if (!found) return reply.status(404).send({ error: { code: ErrorCode.NotFound, message: 'Не знайдено' } } as never)
      const reason = action === 'reject' ? request.body.reason! : null
      const [updated] = await prisma.$transaction([
        prisma.communityExercise.update({
          where: { id },
          data: { status: action === 'approve' ? 'APPROVED' : 'REJECTED', rejectReason: reason, reviewedById: request.staff!.id, reviewedAt: new Date() },
          include: { author },
        }),
        audit(request, `exercise.${action}`, id, { from: found.status.toLowerCase(), ...(reason && { reason }) }),
      ])
      return item(updated)
    }

  api.post(
    '/moderation/exercises/:id/approve',
    { schema: { params: idParams, response: { 200: moderationItemSchema, 404: errorResponseSchema } } },
    decide('approve') as never,
  )
  api.post(
    '/moderation/exercises/:id/reject',
    { schema: { params: idParams, body: rejectExerciseRequestSchema, response: { 200: moderationItemSchema, 404: errorResponseSchema } } },
    decide('reject') as never,
  )
}
