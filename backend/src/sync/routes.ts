import { SYNC_LIMITS, syncRequestSchema, syncResponseSchema, type SyncChange } from '@fitpulse/contracts'
import { authenticate, rateLimit } from '@fitpulse/server-core'
import { requireActiveUser } from '../auth/active-user.js'
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
  api.addHook('onRequest', authenticate(tokens, redis, app.log))
  api.addHook('onRequest', requireActiveUser(prisma))

  api.post(
    '/',
    // Up to 500 changes of up to 64 KB each would exceed the default 1 MB body limit
    { bodyLimit: 5 * 1024 * 1024, schema: { body: syncRequestSchema, response: { 200: syncResponseSchema } } },
    async (request) => {
      const userId = request.auth!.accountId
      await rateLimit(redis, { key: `sync:${userId}`, limit: 30, windowSeconds: 60, enabled: config.RATE_LIMIT_ENABLED, log: app.log })

      // A bad record is skipped and reported, so it cannot stop the rest of the device's sync
      const rejected: { kind: SyncChange['kind']; id: string; reason: 'too_large' | 'invalid' }[] = []
      const accepted = request.body.changes.filter((change) => {
        const text = JSON.stringify(change.data ?? null)
        if (text.length > SYNC_LIMITS.recordBytes) rejected.push({ kind: change.kind, id: change.id, reason: 'too_large' })
        // Postgres jsonb cannot store the NUL character
        else if (text.includes('\\u0000')) rejected.push({ kind: change.kind, id: change.id, reason: 'invalid' })
        else return true
        return false
      })

      // One row per record: the latest change wins inside a request too
      const latest = new Map<string, SyncChange>()
      const limit = now().getTime() + FUTURE_SLACK_MS
      for (const change of accepted) {
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

      // One account's syncs run one at a time: seq values are handed out before commit, so two
      // overlapping writers could otherwise let a reader move its cursor past a row not yet visible
      const { written, stale, page } = await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`
        let written: { kind: string; record_id: string; seq: bigint }[] = []
        let stale: Row[] = []
        if (incoming.length > 0) {
          const payload = JSON.stringify(incoming)
          written = await tx.$queryRaw<{ kind: string; record_id: string; seq: bigint }[]>`
            INSERT INTO sync_records (user_id, kind, record_id, data, updated_at, deleted_at, seq)
            SELECT ${userId}::uuid, c.kind, c.record_id, c.data, c.updated_at, c.deleted_at, nextval(pg_get_serial_sequence('sync_records', 'seq'))
            FROM jsonb_to_recordset(${payload}::jsonb) AS c(kind text, record_id text, data jsonb, updated_at timestamptz, deleted_at timestamptz)
            ON CONFLICT (user_id, kind, record_id) DO UPDATE
              SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at, deleted_at = EXCLUDED.deleted_at,
                  seq = nextval(pg_get_serial_sequence('sync_records', 'seq'))
              WHERE sync_records.updated_at < EXCLUDED.updated_at
            RETURNING kind, record_id, seq`
          const writtenKeys = new Set(written.map((w) => key(w.kind, w.record_id)))
          const outdated = incoming.filter((c) => !writtenKeys.has(key(c.kind, c.record_id)))
          if (outdated.length > 0) {
            // A device that sent an outdated version gets the current one, even if it is behind its cursor
            stale = await tx.$queryRaw<Row[]>`
              SELECT kind, record_id, data, updated_at, deleted_at, seq FROM sync_records
              WHERE user_id = ${userId}::uuid
                AND (kind, record_id) IN (SELECT k.kind, k.record_id FROM jsonb_to_recordset(${JSON.stringify(outdated)}::jsonb) AS k(kind text, record_id text))`
          }
        }
        const page = await tx.$queryRaw<Row[]>`
          SELECT kind, record_id, data, updated_at, deleted_at, seq FROM sync_records
          WHERE user_id = ${userId}::uuid AND seq > ${BigInt(request.body.cursor)}
          ORDER BY seq
          LIMIT ${SYNC_LIMITS.page + 1}`
        return { written, stale, page }
      })

      const hasMore = page.length > SYNC_LIMITS.page
      const rows = page.slice(0, SYNC_LIMITS.page)
      const cursor = rows.length > 0 ? rows.at(-1)!.seq.toString() : request.body.cursor

      // The device already has what it just sent
      const own = new Set(written.map((w) => w.seq.toString()))
      const out = new Map<string, Row>()
      for (const row of stale) out.set(key(row.kind, row.record_id), row)
      for (const row of rows) if (!own.has(row.seq.toString())) out.set(key(row.kind, row.record_id), row)

      return { applied: written.length, cursor, hasMore, changes: [...out.values()].map(toChange), rejected }
    },
  )
}
