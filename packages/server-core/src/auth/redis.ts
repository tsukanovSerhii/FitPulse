import type { Redis } from 'ioredis'

/** The Redis commands the auth kit uses; tests pass an in-memory fake. */
export type AuthRedis = Pick<Redis, 'set' | 'exists' | 'incr' | 'expire' | 'ttl'>

export interface WarnLog {
  warn(obj: unknown, msg?: string): void
}

export const REVOKED_TTL_SECONDS = 15 * 60
export const revokedKey = (sessionId: string) => `auth:revoked:${sessionId}`
