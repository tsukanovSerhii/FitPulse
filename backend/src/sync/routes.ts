import { ErrorCode, errorResponseSchema, SYNC_LIMITS, syncRequestSchema, syncResponseSchema, type ErrorResponse, type SyncChange } from '@fitpulse/contracts'
import { authenticate, rateLimit } from '@fitpulse/server-core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { AccessTokens, ApiConfig, PrismaClient, Redis } from '../deps.js'

interface Row {
  kind: string
  record_id: string
  data: unknown
  updated_at: Date
  deleted_at: Date | null
  seq: bigint
}

const FUTURE_SLACK_MS = 5 * 60 * 1000
const key = (kind: string, id: string) => `${kind}\u0000${id}`

const toChange = (row: Row): SyncChange => ({
  kind: row.kind as SyncChange['kind'],
  id: row.record_id,
  data: row.deleted_at ? null : row.data,
  updatedAt: row.updated_at.toISOString(),
})

export async function syncRoutes(
  app: FastifyInstance,
  { config, prisma, redis, tokens, now = () => new Date() }: { config: ApiConfig; prisma: PrismaClient; redis: Redis; tokens: AccessTokens; now?: () => Date },
) {
  const api = app.withTypeProvider<ZodTypeProvider>()
  api.addHook('preHandler', authenticate(tokens, redis, app.log))

  api.post(
    '/',
    // Up to 500 changes of up to 64 KB each would exceed the default 1 MB body limit
    { bodyLimit: 5 * 1024 * 1024, schema: { body: syncRequestSchema, response: { 200: syncResponseSchema, 400: errorResponseSchema } } },
    async (request, reply) => {
      const userId = request.auth!.accountId
      await rateLimit(redis, { key: `sync:${userId}`, limit: 30, windowSeconds: 60, enabled: config.RATE_LIMIT_ENABLED, log: app.log })

      const tooBig = request.body.changes.findIndex((change) => JSON.stringify(change.data ?? null).length > SYNC_LIMITS.recordBytes)
      if (tooBig !== -1) {
        const body: ErrorResponse = {
          error: { code: ErrorCode.Validation, message: 'Request validation failed', details: [{ path: `changes.${tooBig}.data`, message: 'Запис більший за 64 КБ' }] },
        }
        return reply.status(400).send(body)
      }

      // One row per record: the latest change wins inside a request too
      const latest = new Map<string, SyncChange>()
      const limit = now().getTime() + FUTURE_SLACK_MS
      for (const change of request.body.changes) {
        const updatedAt = new Date(Math.min(new Date(change.updatedAt).getTime(), limit)).toISOString()
        const current = latest.get(key(change.kind, change.id))
        if (!current || current.updatedAt <= updatedAt) latest.set(key(change.kind, change.id), { ...change, updatedAt })
      }
      const incoming = [...latest.values()].map((c) => ({
        kind: c.kind,
        record_id: c.id,
        data: c.data,
        updated_at: c.updatedAt,
        deleted_at: c.data === null ? c.updatedAt : null,
      }))

      let written: { kind: string; record_id: string; seq: bigint }[] = []
      let stale: Row[] = []
      if (incoming.length > 0) {
        const payload = JSON.stringify(incoming)
        written = await prisma.$queryRaw<{ kind: string; record_id: string; seq: bigint }[]>`
          INSERT INTO sync_records (user_id, kind, record_id, data, updated_at, deleted_at, seq)
          SELECT ${userId}::uuid, c.kind, c.record_id, c.data, c.updated_at, c.deleted_at, nextval(pg_get_serial_sequence('sync_records', 'seq'))
          FROM jsonb_to_recordset(${payload}::jsonb) AS c(kind text, record_id text, data jsonb, updated_at timestamptz, deleted_at timestamptz)
          ON CONFLICT (user_id, kind, record_id) DO UPDATE
            SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at, deleted_at = EXCLUDED.deleted_at,
                seq = nextval(pg_get_serial_sequence('sync_records', 'seq'))
            WHERE sync_records.updated_at < EXCLUDED.updated_at
          RETURNING kind, record_id, seq`
        const writtenKeys = new Set(written.map((w) => key(w.kind, w.record_id)))
        const rejected = incoming.filter((c) => !writtenKeys.has(key(c.kind, c.record_id)))
        if (rejected.length > 0) {
          // A device that sent an outdated version gets the current one, even if it is behind its cursor
          stale = await prisma.$queryRaw<Row[]>`
            SELECT kind, record_id, data, updated_at, deleted_at, seq FROM sync_records
            WHERE user_id = ${userId}::uuid
              AND (kind, record_id) IN (SELECT k.kind, k.record_id FROM jsonb_to_recordset(${JSON.stringify(rejected)}::jsonb) AS k(kind text, record_id text))`
        }
      }

      const page = await prisma.$queryRaw<Row[]>`
        SELECT kind, record_id, data, updated_at, deleted_at, seq FROM sync_records
        WHERE user_id = ${userId}::uuid AND seq > ${BigInt(request.body.cursor)}
        ORDER BY seq
        LIMIT ${SYNC_LIMITS.page + 1}`
      const hasMore = page.length > SYNC_LIMITS.page
      const rows = page.slice(0, SYNC_LIMITS.page)
      const cursor = rows.length > 0 ? rows.at(-1)!.seq.toString() : request.body.cursor

      // The device already has what it just sent
      const own = new Set(written.map((w) => w.seq.toString()))
      const out = new Map<string, Row>()
      for (const row of stale) out.set(key(row.kind, row.record_id), row)
      for (const row of rows) if (!own.has(row.seq.toString())) out.set(key(row.kind, row.record_id), row)

      return { applied: written.length, cursor, hasMore, changes: [...out.values()].map(toChange) }
    },
  )
}
