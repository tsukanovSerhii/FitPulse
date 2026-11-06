import { afterEach, describe, expect, it } from 'vitest'
import { createBaseApp } from '../../src/index.js'
import {
  authenticate,
  clearRefreshCookie,
  createAccessTokens,
  rateLimit,
  readRefreshCookie,
  registerCookies,
  setRefreshCookie,
} from '../../src/auth/index.js'
import { brokenRedis, fakeRedis, silentLog } from './fakes.js'

const tokens = createAccessTokens('a-test-secret-that-is-at-least-32-chars')
let app: ReturnType<typeof createBaseApp>

afterEach(async () => {
  await app?.close()
})

describe('rateLimit', () => {
  it('blocks the request over the limit with retryAfter', async () => {
    const { redis } = fakeRedis()
    const opts = { key: 'login:1.2.3.4', limit: 2, windowSeconds: 60, enabled: true, log: silentLog }
    await rateLimit(redis, opts)
    await rateLimit(redis, opts)
    await expect(rateLimit(redis, opts)).rejects.toMatchObject({ code: 'RATE_LIMITED', statusCode: 429, retryAfter: 60 })
  })

  it('rate limit allows the request when Redis fails', async () => {
    await expect(
      rateLimit(brokenRedis, { key: 'k', limit: 1, windowSeconds: 60, enabled: true, log: silentLog }),
    ).resolves.toBeUndefined()
  })

  it('does nothing when disabled', async () => {
    const { redis } = fakeRedis()
    const opts = { key: 'k', limit: 1, windowSeconds: 60, enabled: false, log: silentLog }
    await rateLimit(redis, opts)
    await expect(rateLimit(redis, opts)).resolves.toBeUndefined()
  })

  it('error body carries Retry-After', async () => {
    const { redis } = fakeRedis()
    app = createBaseApp({ logger: false })
    app.post('/limited', async () => {
      await rateLimit(redis, { key: 'x', limit: 0, windowSeconds: 30, enabled: true, log: silentLog })
      return { ok: true }
    })
    const res = await app.inject({ method: 'POST', url: '/limited', payload: {} })
    expect(res.statusCode).toBe(429)
    expect(res.headers['retry-after']).toBe('30')
    expect(res.json().error.code).toBe('RATE_LIMITED')
  })
})

async function protectedApp(redis = fakeRedis().redis) {
  app = createBaseApp({ logger: false })
  app.get('/me', { preHandler: authenticate(tokens, redis, silentLog) }, async (request) => request.auth)
  return app
}

describe('authenticate', () => {
  it('sets request.auth from a valid bearer token', async () => {
    await protectedApp()
    const token = await tokens.sign({ sub: 'u1', sid: 's1' })
    const res = await app.inject({ method: 'GET', url: '/me', headers: { authorization: `Bearer ${token}` } })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ accountId: 'u1', sessionId: 's1' })
  })

  it('rejects a missing token', async () => {
    await protectedApp()
    const res = await app.inject({ method: 'GET', url: '/me' })
    expect(res.statusCode).toBe(401)
    expect(res.json().error.code).toBe('UNAUTHORIZED')
  })

  it('authenticate rejects a revoked session', async () => {
    const { redis } = fakeRedis()
    await redis.set('auth:revoked:s1', '1', 'EX', 900)
    await protectedApp(redis)
    const token = await tokens.sign({ sub: 'u1', sid: 's1' })
    const res = await app.inject({ method: 'GET', url: '/me', headers: { authorization: `Bearer ${token}` } })
    expect(res.statusCode).toBe(401)
  })

  it('authenticate allows when the revocation check fails', async () => {
    await protectedApp(brokenRedis)
    const token = await tokens.sign({ sub: 'u1', sid: 's1' })
    const res = await app.inject({ method: 'GET', url: '/me', headers: { authorization: `Bearer ${token}` } })
    expect(res.statusCode).toBe(200)
  })
})

describe('refresh cookie', () => {
  async function cookieApp() {
    app = createBaseApp({ logger: false })
    await registerCookies(app)
    app.post('/set', async (request, reply) => {
      const { remember } = request.body as { remember: boolean }
      setRefreshCookie(reply, 'fp_refresh', 'tok', { remember, secure: true })
      return {}
    })
    app.post('/read', async (request) => ({ value: readRefreshCookie(request, 'fp_refresh') ?? null }))
    app.post('/clear', async (_request, reply) => {
      clearRefreshCookie(reply, 'fp_refresh', true)
      return {}
    })
  }

  it('cookie has httpOnly, SameSite=Lax, Path=/api/auth and Max-Age only when remembered', async () => {
    await cookieApp()
    const remembered = String((await app.inject({ method: 'POST', url: '/set', payload: { remember: true } })).headers['set-cookie'])
    expect(remembered).toContain('fp_refresh=tok')
    expect(remembered).toContain('HttpOnly')
    expect(remembered).toContain('SameSite=Lax')
    expect(remembered).toContain('Path=/api/auth')
    expect(remembered).toContain('Secure')
    expect(remembered).toContain(`Max-Age=${30 * 24 * 60 * 60}`)
    const tabOnly = String((await app.inject({ method: 'POST', url: '/set', payload: { remember: false } })).headers['set-cookie'])
    expect(tabOnly).not.toContain('Max-Age')
  })

  it('reads and clears the cookie', async () => {
    await cookieApp()
    const read = await app.inject({ method: 'POST', url: '/read', payload: {}, cookies: { fp_refresh: 'abc' } })
    expect(read.json()).toEqual({ value: 'abc' })
    const cleared = String((await app.inject({ method: 'POST', url: '/clear', payload: {} })).headers['set-cookie'])
    expect(cleared).toMatch(/fp_refresh=;.*(Max-Age=0|Expires=Thu, 01 Jan 1970)/)
  })
})
