import { analyticsDevicesSchema, analyticsGeoSchema, analyticsOverviewSchema, analyticsQuerySchema } from '@fitpulse/contracts'
import { Prisma, type PrismaClient } from '@fitpulse/db'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

const DAY = 24 * 60 * 60 * 1000

interface Totals {
  signups: number
  activeUsers: number
  workouts: number
  minutes: number
}

/** Totals for the calendar days [from, to] (UTC, inclusive), as date strings. */
async function totals(prisma: PrismaClient, from: string, to: string) {
  const [row] = await prisma.$queryRaw<Totals[]>`
    SELECT
      (SELECT count(*) FROM users WHERE created_at::date BETWEEN ${from}::date AND ${to}::date)::int AS signups,
      (SELECT count(DISTINCT user_id) FROM user_activity WHERE minutes > 0 AND day BETWEEN ${from}::date AND ${to}::date)::int AS "activeUsers",
      (SELECT count(*) FROM sync_records
        WHERE kind = 'workout' AND deleted_at IS NULL AND left(data->>'date', 10) BETWEEN ${from} AND ${to})::int AS workouts,
      (SELECT coalesce(sum(minutes), 0) FROM user_activity WHERE day BETWEEN ${from}::date AND ${to}::date)::int AS minutes`
  const t = row!
  return {
    signups: t.signups,
    activeUsers: t.activeUsers,
    workouts: t.workouts,
    minutesPerActive: t.activeUsers > 0 ? Math.round((t.minutes / t.activeUsers) * 10) / 10 : 0,
  }
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10)

/** Users counted once each, by the most recent sign-in or refresh within the period. */
const latestSessions = (since: Date) => Prisma.sql`
  SELECT DISTINCT ON (user_id) user_id, device_type, os, browser, app_mode, country, city
  FROM sessions
  WHERE coalesce(last_seen_at, created_at) >= ${since}
  ORDER BY user_id, coalesce(last_seen_at, created_at) DESC`

const COLUMNS = { deviceTypes: 'device_type', os: 'os', browsers: 'browser', appModes: 'app_mode' } as const

export function analyticsRoutes(app: FastifyInstance, prisma: PrismaClient) {
  const api = app.withTypeProvider<ZodTypeProvider>()

  api.get('/analytics/overview', { schema: { querystring: analyticsQuerySchema, response: { 200: analyticsOverviewSchema } } }, async (request) => {
    const { days } = request.query
    const today = new Date()
    const from = isoDay(new Date(today.getTime() - (days - 1) * DAY))
    const prevTo = isoDay(new Date(today.getTime() - days * DAY))
    const prevFrom = isoDay(new Date(today.getTime() - (2 * days - 1) * DAY))

    const series = await prisma.$queryRaw<{ day: string; signups: number; active: number; workouts: number; minutes: number }[]>`
      WITH days AS (SELECT generate_series(${from}::date, ${isoDay(today)}::date, interval '1 day')::date AS day)
      SELECT d.day::text AS day,
        (SELECT count(*) FROM users u WHERE u.created_at::date = d.day)::int AS signups,
        (SELECT count(*) FROM user_activity a WHERE a.day = d.day AND a.minutes > 0)::int AS active,
        (SELECT count(*) FROM sync_records s
          WHERE s.kind = 'workout' AND s.deleted_at IS NULL AND left(s.data->>'date', 10) = d.day::text)::int AS workouts,
        (SELECT coalesce(sum(a.minutes), 0) FROM user_activity a WHERE a.day = d.day)::int AS minutes
      FROM days d ORDER BY d.day`

    // Returning users: signed up 8–14 days ago, active at least once in the last 7 days
    const [cohort] = await prisma.$queryRaw<{ size: number; back: number }[]>`
      SELECT count(*)::int AS size,
        count(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM user_activity a WHERE a.user_id = u.id AND a.minutes > 0 AND a.day >= ${isoDay(new Date(today.getTime() - 6 * DAY))}::date
        ))::int AS back
      FROM users u
      WHERE u.created_at >= ${new Date(today.getTime() - 14 * DAY)} AND u.created_at < ${new Date(today.getTime() - 7 * DAY)}`

    return {
      days,
      series,
      current: await totals(prisma, from, isoDay(today)),
      previous: await totals(prisma, prevFrom, prevTo),
      retention: cohort && cohort.size > 0 ? Math.round((cohort.back / cohort.size) * 100) / 100 : null,
    }
  })

  api.get('/analytics/devices', { schema: { querystring: analyticsQuerySchema, response: { 200: analyticsDevicesSchema } } }, async (request) => {
    const since = new Date(Date.now() - request.query.days * DAY)
    const entries = await Promise.all(
      (Object.entries(COLUMNS) as [keyof typeof COLUMNS, string][]).map(async ([key, column]) => {
        const rows = await prisma.$queryRaw<{ name: string; count: number }[]>`
          SELECT ${Prisma.raw(column)} AS name, count(*)::int AS count FROM (${latestSessions(since)}) latest
          WHERE ${Prisma.raw(column)} IS NOT NULL GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 12`
        return [key, rows] as const
      }),
    )
    return Object.fromEntries(entries) as Record<keyof typeof COLUMNS, { name: string; count: number }[]>
  })

  api.get('/analytics/geo', { schema: { querystring: analyticsQuerySchema, response: { 200: analyticsGeoSchema } } }, async (request) => {
    const since = new Date(Date.now() - request.query.days * DAY)
    const [countries, cities] = await Promise.all([
      prisma.$queryRaw<{ name: string; count: number }[]>`
        SELECT country AS name, count(*)::int AS count FROM (${latestSessions(since)}) latest
        WHERE country IS NOT NULL GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 20`,
      prisma.$queryRaw<{ name: string; country: string; count: number }[]>`
        SELECT city AS name, country, count(*)::int AS count FROM (${latestSessions(since)}) latest
        WHERE city IS NOT NULL AND country IS NOT NULL GROUP BY 1, 2 ORDER BY 3 DESC, 1 LIMIT 20`,
    ])
    return { countries, cities }
  })
}

/** Minutes, daily activity and recent sessions for one user's card. */
export async function userActivity(prisma: PrismaClient, userId: string) {
  const today = new Date()
  const from = isoDay(new Date(today.getTime() - 29 * DAY))
  const [activity, sessions] = await Promise.all([
    prisma.$queryRaw<{ day: string; minutes: number }[]>`
      SELECT d.day::date::text AS day, coalesce(a.minutes, 0)::int AS minutes
      FROM generate_series(${from}::date, ${isoDay(today)}::date, interval '1 day') AS d(day)
      LEFT JOIN user_activity a ON a.user_id = ${userId}::uuid AND a.day = d.day::date
      ORDER BY d.day`,
    prisma.session.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])
  const sumFrom = (days: number) => activity.slice(-days).reduce((sum, d) => sum + d.minutes, 0)
  const now = new Date()
  return {
    minutes7d: sumFrom(7),
    minutes30d: sumFrom(30),
    activity,
    country: sessions[0]?.country ?? null,
    sessions: sessions.map((s) => ({
      id: s.id,
      deviceType: s.deviceType,
      os: s.os,
      browser: s.browser,
      appMode: s.appMode,
      country: s.country,
      city: s.city,
      ipPrefix: s.ipPrefix,
      createdAt: s.createdAt.toISOString(),
      lastSeenAt: s.lastSeenAt?.toISOString() ?? null,
      active: !s.revokedAt && s.expiresAt > now,
    })),
  }
}
