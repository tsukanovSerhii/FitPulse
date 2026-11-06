import fastifyCookie from '@fastify/cookie'
import type { FastifyInstance, FastifyReply, FastifyRequest, preHandlerAsyncHookHandler } from 'fastify'
import { AuthError } from './errors.js'
import { revokedKey, type AuthRedis, type WarnLog } from './redis.js'
import { REMEMBER_MS } from './sessions.js'
import type { AccessTokens } from './tokens.js'

declare module 'fastify' {
  interface FastifyRequest {
    auth?: { accountId: string; sessionId: string; role?: string }
  }
}

/** Fixed-window limit; Redis being down never blocks a sign-in. */
export async function rateLimit(
  redis: AuthRedis,
  { key, limit, windowSeconds, enabled, log }: { key: string; limit: number; windowSeconds: number; enabled: boolean; log: WarnLog },
): Promise<void> {
  if (!enabled) return
  let count: number
  let retryAfter = windowSeconds
  try {
    const redisKey = `rate:${key}`
    count = await redis.incr(redisKey)
    if (count === 1) await redis.expire(redisKey, windowSeconds)
    if (count > limit) {
      const ttl = await redis.ttl(redisKey)
      if (ttl > 0) retryAfter = ttl
      // INCR succeeded but EXPIRE never ran (dropped connection): give the counter its window back
      else await redis.expire(redisKey, windowSeconds)
    }
  } catch (err) {
    log.warn({ err, key }, 'Rate limit skipped: Redis unavailable')
    return
  }
  if (count > limit) throw new AuthError('RATE_LIMITED', { retryAfter })
}

/** preHandler that requires `Authorization: Bearer <access token>` of a session that is not revoked. */
export function authenticate(tokens: AccessTokens, redis: AuthRedis, log: WarnLog): preHandlerAsyncHookHandler {
  return async (request: FastifyRequest) => {
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) throw new AuthError('UNAUTHORIZED')
    const claims = await tokens.verify(header.slice('Bearer '.length))
    let revoked = false
    try {
      revoked = (await redis.exists(revokedKey(claims.sid))) === 1
    } catch (err) {
      log.warn({ err }, 'Revocation check skipped: Redis unavailable')
    }
    if (revoked) throw new AuthError('UNAUTHORIZED')
    request.auth = { accountId: claims.sub, sessionId: claims.sid, ...(claims.role && { role: claims.role }) }
  }
}

export async function registerCookies(app: FastifyInstance) {
  await app.register(fastifyCookie)
}

const COOKIE_PATH = '/api/auth'

export function setRefreshCookie(reply: FastifyReply, name: string, token: string, { remember, secure }: { remember: boolean; secure: boolean }) {
  reply.setCookie(name, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: COOKIE_PATH,
    // Without "remember me" the cookie ends with the browser session
    ...(remember && { maxAge: REMEMBER_MS / 1000 }),
  })
}

export function clearRefreshCookie(reply: FastifyReply, name: string, secure: boolean) {
  reply.clearCookie(name, { httpOnly: true, sameSite: 'lax', secure, path: COOKIE_PATH })
}

export function readRefreshCookie(request: FastifyRequest, name: string): string | undefined {
  return request.cookies[name] || undefined
}
