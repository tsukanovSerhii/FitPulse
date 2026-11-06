import type { AuthRedis, SessionRecord, SessionRepo } from '../../src/auth/index.js'

/** In-memory Redis with the few commands the auth kit uses. */
export function fakeRedis() {
  const values = new Map<string, { value: string; expiresAt?: number }>()
  const alive = (key: string) => {
    const entry = values.get(key)
    if (entry?.expiresAt && entry.expiresAt <= Date.now()) values.delete(key)
    return values.get(key)
  }
  const redis: AuthRedis = {
    async set(key: string, value: string, _ex: 'EX', seconds: number) {
      values.set(key, { value, expiresAt: Date.now() + seconds * 1000 })
      return 'OK'
    },
    async exists(key: string) {
      return alive(key) ? 1 : 0
    },
    async incr(key: string) {
      const next = Number(alive(key)?.value ?? 0) + 1
      values.set(key, { value: String(next), expiresAt: values.get(key)?.expiresAt })
      return next
    },
    async expire(key: string, seconds: number) {
      const entry = alive(key)
      if (entry) entry.expiresAt = Date.now() + seconds * 1000
      return entry ? 1 : 0
    },
    async ttl(key: string) {
      const entry = alive(key)
      return entry?.expiresAt ? Math.ceil((entry.expiresAt - Date.now()) / 1000) : -1
    },
  } as AuthRedis
  return { redis, values }
}

/** Redis whose every command fails, as when the server is down. */
export const brokenRedis = new Proxy({}, { get: () => () => Promise.reject(new Error('redis down')) }) as AuthRedis

export function fakeSessionRepo() {
  const rows = new Map<string, SessionRecord & { refreshTokenHash: string; userAgent?: string }>()
  let seq = 0
  const repo: SessionRepo = {
    async create(data) {
      const id = `s${++seq}`
      rows.set(id, { id, ...data, revokedAt: null, previousTokenHash: null, rotatedAt: null })
      return { id }
    },
    async findByTokenHash(hash) {
      return [...rows.values()].find((row) => row.refreshTokenHash === hash) ?? null
    },
    async findByPreviousHash(hash) {
      return [...rows.values()].find((row) => row.previousTokenHash === hash) ?? null
    },
    async rotate(id, data) {
      await Promise.resolve()
      const row = rows.get(id)!
      // Compare-and-swap like the Prisma repos: only the holder of the current token rotates
      if (row.refreshTokenHash !== data.previousTokenHash) return false
      Object.assign(row, data)
      return true
    },
    async revoke(id) {
      rows.get(id)!.revokedAt = new Date()
    },
    async revokeAllForAccount(accountId) {
      const ids = [...rows.values()].filter((row) => row.accountId === accountId && !row.revokedAt).map((row) => row.id)
      for (const id of ids) rows.get(id)!.revokedAt = new Date()
      return ids
    },
  }
  return { repo, rows }
}

export const silentLog = { warn: () => {} }
