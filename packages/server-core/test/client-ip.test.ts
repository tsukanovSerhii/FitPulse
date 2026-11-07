import { afterEach, describe, expect, it } from 'vitest'
import { buildServiceApp, parseConfig, baseEnvSchema } from '../src/index.js'

const stubs = {
  prisma: { $queryRaw: async () => [], $disconnect: async () => {} },
  redis: { ping: async () => 'PONG', quit: async () => 'OK' },
}
let app: Awaited<ReturnType<typeof buildServiceApp>>

async function build(secret?: string) {
  const config = parseConfig(baseEnvSchema, {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
    REDIS_URL: 'redis://localhost:6379',
    ...(secret && { PROXY_SECRET: secret }),
  })
  app = await buildServiceApp({ config, ...stubs })
  app.get('/ip', async (request) => ({ ip: request.clientIp }))
  return app
}

afterEach(() => app?.close())

const SECRET = 'a-proxy-secret-that-is-long-enough'

describe('client IP', () => {
  it('ignores addresses the client put in X-Forwarded-For', async () => {
    await build()
    const res = await app.inject({ url: '/ip', remoteAddress: '10.0.0.1', headers: { 'x-forwarded-for': '1.1.1.1, 9.9.9.9' } })
    // Render's edge appends the real address last; anything before it came from the client
    expect(res.json().ip).toBe('9.9.9.9')
  })

  it('trusts X-Client-IP only from our own nginx with the shared secret', async () => {
    await build(SECRET)
    const ok = await app.inject({ url: '/ip', remoteAddress: '10.0.0.1', headers: { 'x-client-ip': '5.5.5.5', 'x-proxy-secret': SECRET, 'x-forwarded-for': '9.9.9.9' } })
    expect(ok.json().ip).toBe('5.5.5.5')
    const forged = await app.inject({ url: '/ip', remoteAddress: '10.0.0.1', headers: { 'x-client-ip': '5.5.5.5', 'x-proxy-secret': 'wrong', 'x-forwarded-for': '9.9.9.9' } })
    expect(forged.json().ip).toBe('9.9.9.9')
  })
})
