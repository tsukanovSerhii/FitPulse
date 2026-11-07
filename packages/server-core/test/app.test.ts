import { errorResponseSchema } from '@fitpulse/contracts'
import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createBaseApp } from '../src/index.js'

let app: ReturnType<typeof createBaseApp>

afterEach(async () => {
  await app.close()
})

describe('createBaseApp', () => {
  it('unknown route returns 404 error body', async () => {
    app = createBaseApp({ logger: false })
    const res = await app.inject({ method: 'GET', url: '/nope' })
    expect(res.statusCode).toBe(404)
    const body = errorResponseSchema.parse(res.json())
    expect(body.error.code).toBe('NOT_FOUND')
  })

  it('validation error returns 400 with details', async () => {
    app = createBaseApp({ logger: false })
    app.post('/items', { schema: { body: z.object({ name: z.string().min(1) }) } }, async () => ({ ok: true }))
    const res = await app.inject({ method: 'POST', url: '/items', payload: { name: '' } })
    expect(res.statusCode).toBe(400)
    const body = errorResponseSchema.parse(res.json())
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.details?.[0]?.path).toBe('name')
  })

  it('unexpected error hides details', async () => {
    app = createBaseApp({ logger: false })
    app.get('/boom', async () => {
      throw new Error('secret')
    })
    const res = await app.inject({ method: 'GET', url: '/boom' })
    expect(res.statusCode).toBe(500)
    expect(res.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } })
    expect(res.body).not.toContain('secret')
  })
})

describe('response headers', () => {
  it('API answers are never cached or sniffed', async () => {
    app = createBaseApp({ logger: false })
    app.get('/x', async () => ({ ok: true }))
    const res = await app.inject({ url: '/x' })
    expect(res.headers['cache-control']).toBe('no-store')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['x-frame-options']).toBe('DENY')
  })
})
