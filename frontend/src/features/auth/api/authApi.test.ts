import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'

const { local, session } = installMemoryStorage()

const { authApi, authErrorMessage } = await import('./authApi')
const { STORAGE_KEYS } = await import('@/shared/storage/localStorage')
const { SESSION_KEYS } = await import('@/shared/storage/sessionStorage')
const { ApiError, NetworkError } = await import('@/shared/api/http')

const user = { id: '7b0c0d63-7f2e-4f39-9a2b-0d7c2a1e5f10', name: 'Ira', email: 'ira@mail.com', plan: 'free', createdAt: '2026-11-07T10:00:00.000Z' }
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const authBody = { accessToken: 'tok', user }

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  local.clear()
  session.clear()
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('authApi', () => {
  it('login caches the user for remembered sessions only in localStorage', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    const signedIn = await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    expect(signedIn).toMatchObject({ id: user.id, name: 'Ira' })
    expect(JSON.parse(local.get(STORAGE_KEYS.SESSION)!)).toBe(user.id)
    expect(JSON.parse(local.get(STORAGE_KEYS.AUTH_USER)!)).toMatchObject({ email: 'ira@mail.com' })
    expect(session.size).toBe(0)
    expect(authApi.cachedUser()?.id).toBe(user.id)
  })

  it('a not-remembered session stays in the tab', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: false })
    expect(local.has(STORAGE_KEYS.SESSION)).toBe(false)
    expect(session.has(SESSION_KEYS.AUTH_SESSION)).toBe(true)
    session.clear()
    expect(authApi.cachedUser()).toBeNull()
  })

  it('restore keeps the cached user on network error', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(authApi.restore()).resolves.toBe('offline')
    expect(authApi.cachedUser()?.id).toBe(user.id)
  })

  it('restore signs out on SESSION_EXPIRED', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    fetchMock.mockResolvedValueOnce(json(401, { error: { code: 'SESSION_EXPIRED', message: 'x' } }))
    await expect(authApi.restore()).resolves.toBeNull()
    expect(authApi.cachedUser()).toBeNull()
  })

  it('restore returns the fresh user from the server', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    fetchMock.mockResolvedValueOnce(json(200, { accessToken: 'tok2', user: { ...user, name: 'Iryna' } }))
    await expect(authApi.restore()).resolves.toMatchObject({ name: 'Iryna' })
    expect(authApi.cachedUser()?.name).toBe('Iryna')
  })

  it('restore and a parallel refresh share one request', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    fetchMock.mockImplementation(async () => json(200, authBody))
    fetchMock.mockClear()
    await Promise.all([authApi.restore(), authApi.restore()])
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/auth/refresh')).toHaveLength(1)
  })

  it('REFRESH_RETRY is retried after a pause', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    fetchMock.mockResolvedValueOnce(json(409, { error: { code: 'REFRESH_RETRY', message: 'x' } }))
    fetchMock.mockResolvedValueOnce(json(409, { error: { code: 'REFRESH_RETRY', message: 'x' } }))
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await expect(authApi.restore()).resolves.toMatchObject({ id: user.id })
  })

  it('a server error on start keeps the user signed in', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    fetchMock.mockResolvedValueOnce(json(500, { error: { code: 'INTERNAL_ERROR', message: 'x' } }))
    await expect(authApi.restore()).resolves.toBe('offline')
    expect(authApi.cachedUser()?.id).toBe(user.id)
  })

  it('without a session restore does not call the server', async () => {
    await expect(authApi.restore()).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('logout clears token, marker and cached user', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await authApi.logout()
    expect(local.has(STORAGE_KEYS.SESSION)).toBe(false)
    expect(local.has(STORAGE_KEYS.AUTH_USER)).toBe(false)
    expect(authApi.cachedUser()).toBeNull()
    expect(fetchMock.mock.calls.at(-1)![0]).toBe('/api/auth/logout')
  })

  it('logout forgets the user on the device before the server answers', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    fetchMock.mockImplementationOnce(() => new Promise(() => {}))
    void authApi.logout()
    await Promise.resolve()
    expect(authApi.cachedUser()).toBeNull()
    expect(local.has(STORAGE_KEYS.SESSION)).toBe(false)
  })

  it('signing out of a not-remembered session wipes the account data from this device', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: false })
    local.set(`${STORAGE_KEYS.WORKOUT_HISTORY}:${user.id}`, '[{"id":"w1"}]')
    local.set(`fitpulse_sync_v1:${user.id}`, '{"cursor":"5","hashes":{}}')
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await authApi.logout()
    expect(local.has(`${STORAGE_KEYS.WORKOUT_HISTORY}:${user.id}`)).toBe(false)
    expect(local.has(`fitpulse_sync_v1:${user.id}`)).toBe(false)
  })

  it('a remembered device keeps its data after sign-out', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    local.set(`${STORAGE_KEYS.WORKOUT_HISTORY}:${user.id}`, '[{"id":"w1"}]')
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await authApi.logout()
    expect(local.has(`${STORAGE_KEYS.WORKOUT_HISTORY}:${user.id}`)).toBe(true)
  })

  it('logout works offline too', async () => {
    fetchMock.mockResolvedValueOnce(json(200, authBody))
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: true })
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await authApi.logout()
    expect(authApi.cachedUser()).toBeNull()
  })
})

describe('authErrorMessage', () => {
  it('explains rate limits in minutes and missing connection', () => {
    expect(authErrorMessage(new ApiError(429, 'RATE_LIMITED', 'x', { retryAfter: 90 }))).toBe('Забагато спроб. Спробуйте за 2 хв')
    expect(authErrorMessage(new NetworkError())).toBe("Немає з'єднання з сервером")
    expect(authErrorMessage(new ApiError(401, 'INVALID_CREDENTIALS', 'Невірний email або пароль'))).toBe('Невірний email або пароль')
    expect(authErrorMessage(new Error('boom'))).toBe('Щось пішло не так. Спробуйте ще раз')
  })
})
