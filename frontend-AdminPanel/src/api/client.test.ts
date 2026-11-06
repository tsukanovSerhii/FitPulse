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
