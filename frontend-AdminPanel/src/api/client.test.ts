import { describe, expect, it, vi } from 'vitest'
import { createAdminClient } from './client.ts'

const admin = { id: '7b0c0d63-7f2e-4f39-9a2b-0d7c2a1e5f10', email: 'a@x.com', role: 'admin', createdAt: '2026-11-07T10:00:00.000Z' }
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('admin client', () => {
  it('two restores at once send one refresh', async () => {
    const fetchFn = vi.fn(async () => json(200, { accessToken: 't', user: admin }))
    const client = createAdminClient(fetchFn as unknown as typeof fetch)
    const [a, b] = await Promise.all([client.restore(), client.restore()])
    expect(a?.email).toBe('a@x.com')
    expect(b?.email).toBe('a@x.com')
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('retries a refresh that another tab just replaced', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(json(409, { error: { code: 'REFRESH_RETRY', message: 'x' } }))
      .mockResolvedValueOnce(json(200, { accessToken: 't', user: admin }))
    const client = createAdminClient(fetchFn as unknown as typeof fetch)
    await expect(client.restore()).resolves.toMatchObject({ role: 'admin' })
  })
})

describe('admin client requests', () => {
  it('sends the token and refreshes once on 401', async () => {
    const calls: string[] = []
    let refreshed = false
    const fetchFn = vi.fn(async (url: string, init: RequestInit = {}) => {
      calls.push(`${init.method ?? 'GET'} ${url} ${(init.headers as Record<string, string>)?.Authorization ?? ''}`)
      if (url === '/api/auth/refresh') {
        refreshed = true
        return json(200, { accessToken: 't2', user: admin })
      }
      if (url === '/api/auth/login') return json(200, { accessToken: 't1', user: admin })
      return refreshed ? json(200, { ok: true }) : json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } })
    })
    const client = createAdminClient(fetchFn as unknown as typeof fetch)
    await client.login('a@x.com', 'pw')
    await expect(client.request('/api/stats')).resolves.toEqual({ ok: true })
    expect(calls).toEqual(['POST /api/auth/login ', 'GET /api/stats Bearer t1', 'POST /api/auth/refresh ', 'GET /api/stats Bearer t2'])
  })

  it('turns error bodies into ApiError with the message', async () => {
    const fetchFn = vi.fn(async () => json(403, { error: { code: 'FORBIDDEN', message: 'Недостатньо прав' } }))
    const client = createAdminClient(fetchFn as unknown as typeof fetch)
    await expect(client.request('/api/staff')).rejects.toMatchObject({ code: 'FORBIDDEN', message: 'Недостатньо прав' })
  })
})

describe('admin client under parallel 401s', () => {
  it('three requests that hit an expired token share one refresh', async () => {
    let refreshes = 0
    const fetchFn = vi.fn(async (url: string, init: RequestInit = {}) => {
      if (url === '/api/auth/refresh') {
        refreshes++
        await new Promise((resolve) => setTimeout(resolve, 10))
        return json(200, { accessToken: 'fresh', user: admin })
      }
      const auth = (init.headers as Record<string, string>)?.Authorization
      return auth === 'Bearer fresh' ? json(200, { ok: true }) : json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } })
    })
    const client = createAdminClient(fetchFn as unknown as typeof fetch)
    await Promise.all([client.request('/api/a'), client.request('/api/b'), client.request('/api/c')])
    expect(refreshes).toBe(1)
  })
})
