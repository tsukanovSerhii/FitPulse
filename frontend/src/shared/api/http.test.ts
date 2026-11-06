import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, NetworkError, setAccessToken, setRefreshHandler } from './http'

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
const unauthorized = () => json(401, { error: { code: 'UNAUTHORIZED', message: 'Потрібно увійти' } })

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  setAccessToken(null)
  setRefreshHandler(async () => false)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('apiRequest', () => {
  it('adds the bearer token and sends JSON', async () => {
    setAccessToken('tok-1')
    fetchMock.mockResolvedValueOnce(json(200, { ok: true }))
    await expect(apiRequest('/api/me', { method: 'PATCH', body: { name: 'Ira' }, auth: true })).resolves.toEqual({ ok: true })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/me')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer tok-1', 'Content-Type': 'application/json' })
    expect(init.body).toBe('{"name":"Ira"}')
  })

  it('refresh is single-flight across calls', async () => {
    setAccessToken('old')
    let refreshes = 0
    setRefreshHandler(async () => {
      refreshes++
      await new Promise((resolve) => setTimeout(resolve, 10))
      setAccessToken('new')
      return true
    })
    fetchMock.mockImplementation(async (_url: string, init: RequestInit) =>
      (init.headers as Record<string, string>).Authorization === 'Bearer new' ? json(200, { ok: true }) : unauthorized(),
    )
    const results = await Promise.all([1, 2, 3].map(() => apiRequest('/api/me', { auth: true })))
    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }])
    expect(refreshes).toBe(1)
  })

  it('gives up when the refresh fails', async () => {
    fetchMock.mockResolvedValue(unauthorized())
    await expect(apiRequest('/api/me', { auth: true })).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
  })

  it('turns error bodies into ApiError with Retry-After', async () => {
    fetchMock.mockResolvedValueOnce(json(429, { error: { code: 'RATE_LIMITED', message: 'Забагато спроб' } }, { 'retry-after': '120' }))
    const error = await apiRequest('/api/auth/login', { method: 'POST', body: {} }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 429, code: 'RATE_LIMITED', retryAfter: 120 })
  })

  it('network failure throws NetworkError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(apiRequest('/api/me')).rejects.toBeInstanceOf(NetworkError)
  })

  it('a gateway error from the proxy counts as no connection', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>502</html>', { status: 502, headers: { 'content-type': 'text/html' } }))
    await expect(apiRequest('/api/me')).rejects.toBeInstanceOf(NetworkError)
  })

  it('204 resolves to undefined', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await expect(apiRequest('/api/auth/logout', { method: 'POST', body: {} })).resolves.toBeUndefined()
  })
})
