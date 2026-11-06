import { AuthError } from './errors.js'
import { REVOKED_TTL_SECONDS, revokedKey, type AuthRedis } from './redis.js'
import { hashToken, newRefreshToken } from './tokens.js'

export interface SessionRecord {
  id: string
  accountId: string
  /** SHA-256 of the current refresh token */
  refreshTokenHash: string
  expiresAt: Date
  revokedAt: Date | null
  remember: boolean
  previousTokenHash: string | null
  rotatedAt: Date | null
}

/** Access to Session or AdminSession rows, so one service serves both APIs. */
export interface SessionRepo {
  create(data: { accountId: string; refreshTokenHash: string; expiresAt: Date; remember: boolean; userAgent?: string }): Promise<{ id: string }>
  findByTokenHash(hash: string): Promise<SessionRecord | null>
  findByPreviousHash(hash: string): Promise<SessionRecord | null>
  /** Compare-and-swap: replaces the token only if `expectedHash` is still the current one; false otherwise */
  rotate(id: string, expectedHash: string, data: { refreshTokenHash: string; previousTokenHash: string; rotatedAt: Date; expiresAt: Date }): Promise<boolean>
  revoke(id: string): Promise<void>
  revokeAllForAccount(accountId: string): Promise<string[]>
}

const HOUR = 60 * 60 * 1000
export const REMEMBER_MS = 30 * 24 * HOUR
export const SHORT_MS = 12 * HOUR
export const ADMIN_MS = 8 * HOUR
export const ROTATION_GRACE_MS = 10_000

export interface SessionServiceOptions {
  repo: SessionRepo
  redis: AuthRedis
  lifetimes: { remember: number; short: number }
  /** App sessions slide forward on refresh; admin sessions end at their original time */
  extendOnRefresh: boolean
  graceMs?: number
  now?: () => Date
}

export function createSessionService({ repo, redis, lifetimes, extendOnRefresh, graceMs = ROTATION_GRACE_MS, now = () => new Date() }: SessionServiceOptions) {
  const lifetime = (remember: boolean) => (remember ? lifetimes.remember : lifetimes.short)

  async function markRevoked(sessionIds: string[]) {
    // Access tokens of these sessions stop working at once, not when they expire
    await Promise.allSettled(sessionIds.map((id) => redis.set(revokedKey(id), '1', 'EX', REVOKED_TTL_SECONDS)))
  }

  async function revoke(sessionId: string) {
    await repo.revoke(sessionId)
    await markRevoked([sessionId])
  }

  return {
    async start(accountId: string, { remember, userAgent }: { remember: boolean; userAgent?: string }) {
      const refreshToken = newRefreshToken()
      const { id } = await repo.create({
        accountId,
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(now().getTime() + lifetime(remember)),
        remember,
        userAgent,
      })
      return { sessionId: id, refreshToken, remember }
    },

    async refresh(token: string) {
      const hash = hashToken(token)
      const at = now()
      const current = await repo.findByTokenHash(hash)

      let session: SessionRecord
      let expectedHash: string
      let previousTokenHash: string
      let rotatedAt: Date
      if (current) {
        if (current.revokedAt || current.expiresAt <= at) throw new AuthError('SESSION_EXPIRED')
        session = current
        expectedHash = hash
        previousTokenHash = hash
        rotatedAt = at
      } else {
        const replaced = await repo.findByPreviousHash(hash)
        if (!replaced || replaced.revokedAt || replaced.expiresAt <= at) throw new AuthError('SESSION_EXPIRED')
        if (!replaced.rotatedAt || at.getTime() - replaced.rotatedAt.getTime() > graceMs) {
          // An old token came back long after it was replaced: treat it as stolen
          await revoke(replaced.id)
          throw new AuthError('SESSION_EXPIRED')
        }
        // Replaced moments ago: the response with the new cookie was probably lost (a reload, a
        // dropped mobile connection) or another tab got it first. Issue a fresh token again; the
        // window stays anchored to the first replacement so it cannot be stretched.
        session = replaced
        expectedHash = replaced.refreshTokenHash
        previousTokenHash = hash
        rotatedAt = replaced.rotatedAt
      }

      const refreshToken = newRefreshToken()
      const rotated = await repo.rotate(session.id, expectedHash, {
        refreshTokenHash: hashToken(refreshToken),
        previousTokenHash,
        rotatedAt,
        expiresAt: extendOnRefresh ? new Date(at.getTime() + lifetime(session.remember)) : session.expiresAt,
      })
      // A parallel request rotated this token first; its new cookie is on the way
      if (!rotated) throw new AuthError('REFRESH_RETRY')
      return { sessionId: session.id, accountId: session.accountId, refreshToken, remember: session.remember }
    },

    revoke,

    /** Sign-out: ends the session that owns this refresh token, if any. */
    async revokeToken(token: string) {
      const session = await repo.findByTokenHash(hashToken(token))
      if (session && !session.revokedAt) await revoke(session.id)
    },

    async revokeAll(accountId: string) {
      await markRevoked(await repo.revokeAllForAccount(accountId))
    },
  }
}

export type SessionService = ReturnType<typeof createSessionService>
