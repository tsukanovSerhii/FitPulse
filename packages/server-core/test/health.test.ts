import { afterEach, describe, expect, it } from 'vitest'
import { createBaseApp, healthRoutes } from '../src/index.js'

let app: ReturnType<typeof createBaseApp>

const fail = () => Promise.reject(new Error('down'))
const pass = () => Promise.resolve()

async function build(checks: Record<string, () => Promise<unknown>>, timeoutMs?: number) {
  app = createBaseApp({ logger: false })
  await app.register(healthRoutes, { prefix: '/api', checks, timeoutMs })
  return app
}

afterEach(async () => {
  await app.close()
})

describe('healthRoutes', () => {
  it('health ignores checks', async () => {
    await build({ database: fail, redis: fail })
    const res = await app.inject({ method: 'GET', url: '/api/health' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: 'ok' })
  })

  it('ready ok when all checks pass', async () => {
    await build({ database: pass, redis: pass })
    const res = await app.inject({ method: 'GET', url: '/api/health/ready' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: 'ok', checks: { database: 'ok', redis: 'ok' } })
  })

  it('ready 503 when a check fails', async () => {
    await build({ database: pass, redis: fail })
    const res = await app.inject({ method: 'GET', url: '/api/health/ready' })
    expect(res.statusCode).toBe(503)
    expect(res.json()).toEqual({ status: 'unavailable', checks: { database: 'ok', redis: 'fail' } })
  })

  it('ready times out a hanging check', async () => {
    await build({ database: () => new Promise(() => {}), redis: pass }, 50)
    const started = Date.now()
    const res = await app.inject({ method: 'GET', url: '/api/health/ready' })
    expect(Date.now() - started).toBeLessThan(500)
    expect(res.statusCode).toBe(503)
    expect(res.json().checks.database).toBe('fail')
  })
})
