import { afterAll, describe, expect, it } from 'vitest'
import { rateLimit } from '../../src/auth/index.js'
import { createRedis } from '../../src/index.js'

const url = process.env.REDIS_URL
if (!url) throw new Error('REDIS_URL must be set for integration tests')
const redis = createRedis(url)

afterAll(() => redis.quit())

describe('rateLimit on real Redis', () => {
  it('sixth attempt in the window is RATE_LIMITED with Retry-After', async () => {
    const key = `test:rate:${Date.now()}`
    const opts = { key, limit: 5, windowSeconds: 60, enabled: true, log: { warn: () => {} } }
    for (let i = 0; i < 5; i++) await rateLimit(redis, opts)
    const error = await rateLimit(redis, opts).catch((e: unknown) => e)
    expect(error).toMatchObject({ code: 'RATE_LIMITED', statusCode: 429 })
    expect((error as { retryAfter: number }).retryAfter).toBeGreaterThan(0)
    expect((error as { retryAfter: number }).retryAfter).toBeLessThanOrEqual(60)
  })
})
