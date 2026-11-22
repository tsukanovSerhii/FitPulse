import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'

const { local, session } = installMemoryStorage()

const { handleDemoRequest, DEMO_KEYS } = await import('./demoServer')

const call = async (path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST') => {
  const res = await handleDemoRequest(path, { method, body: body === undefined ? undefined : JSON.stringify(body) })
  return { status: res.status, body: res.status === 204 ? null : await res.json() }
}

const ira = { name: 'Ira', email: 'Ira@Mail.com', password: 'secret123', remember: true }

beforeEach(() => {
  local.clear()
  session.clear()
})

describe('demo API: accounts', () => {
  it('registers, keeps no plain-text password and answers like the server', async () => {
    const res = await call('/api/auth/register', ira)
    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({ name: 'Ira', email: 'ira@mail.com', plan: 'free' })
    expect(res.body.accessToken).toEqual(expect.any(String))
    expect(local.get(DEMO_KEYS.ACCOUNTS)).not.toContain('secret123')
  })

  it('refuses a second account with the same email', async () => {
    await call('/api/auth/register', ira)
    const res = await call('/api/auth/register', { ...ira, email: 'ira@mail.com ' })
    expect(res).toMatchObject({ status: 409, body: { error: { code: 'EMAIL_TAKEN' } } })
  })

  it('signs in with the right password only', async () => {
    await call('/api/auth/register', ira)
    expect((await call('/api/auth/login', { email: 'ira@mail.com', password: 'wrong', remember: true })).body.error.code).toBe('INVALID_CREDENTIALS')
    expect((await call('/api/auth/login', { email: 'ira@mail.com', password: 'secret123', remember: true })).status).toBe(200)
  })

  it('keeps a remembered session across restarts and a tab session only in the tab', async () => {
    await call('/api/auth/register', ira)
    await call('/api/auth/login', { email: 'ira@mail.com', password: 'secret123', remember: false })
    expect(local.has(DEMO_KEYS.SESSION)).toBe(false)
    expect((await call('/api/auth/refresh', {})).status).toBe(200)

    session.clear()
    expect((await call('/api/auth/refresh', {})).body.error.code).toBe('SESSION_EXPIRED')
  })

  it('creates the offered demo account on its first sign-in', async () => {
    const { DEMO_ACCOUNT } = await import('@/shared/config/demo')
    const res = await call('/api/auth/login', { email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password, remember: true })
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(DEMO_ACCOUNT.email)
    expect((await call('/api/auth/login', { email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password, remember: true })).body.user.id).toBe(res.body.user.id)
    expect(JSON.parse(local.get(`fitpulse_history_v1:${res.body.user.id}`)!).length).toBeGreaterThan(20)
  })

  it('keeps the demo visitor’s own journal on the next sign-in', async () => {
    const { DEMO_ACCOUNT } = await import('@/shared/config/demo')
    const id = (await call('/api/auth/login', { email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password, remember: true })).body.user.id
    local.set(`fitpulse_history_v1:${id}`, '[]')
    await call('/api/auth/login', { email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password, remember: true })
    expect(local.get(`fitpulse_history_v1:${id}`)).toBe('[]')
  })

  it('ends the session on logout', async () => {
    await call('/api/auth/register', ira)
    expect((await call('/api/auth/logout', {})).status).toBe(204)
    expect((await call('/api/auth/refresh', {})).status).toBe(401)
  })

  it('changes the email only with the current password', async () => {
    await call('/api/auth/register', ira)
    expect((await call('/api/me', { email: 'new@mail.com', currentPassword: 'nope' }, 'PATCH')).status).toBe(401)
    const res = await call('/api/me', { name: 'Iryna', email: 'new@mail.com', currentPassword: 'secret123' }, 'PATCH')
    expect(res.body).toMatchObject({ name: 'Iryna', email: 'new@mail.com' })
  })

  it('explains that password reset needs the real server', async () => {
    const res = await call('/api/auth/password/forgot', { email: 'ira@mail.com' })
    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/демо/i)
  })
})

describe('demo API: data', () => {
  it('accepts sync changes and sends nothing back', async () => {
    await call('/api/auth/register', ira)
    const change = { kind: 'plan', id: 'p1', data: {}, updatedAt: '2026-11-23T10:00:00.000Z' }
    const res = await call('/api/sync', { cursor: '0', changes: [change] })
    expect(res.body).toEqual({ applied: 1, cursor: '0', hasMore: false, changes: [], rejected: [] })
  })

  it('needs a session for sync and exercises', async () => {
    expect((await call('/api/sync', { cursor: '0', changes: [] })).status).toBe(401)
    expect((await call('/api/exercises/community')).status).toBe(401)
  })

  it('keeps the user’s exercise submissions pending', async () => {
    await call('/api/auth/register', ira)
    const exercise = { name: 'Тяга', primaryMuscle: 'back', muscleGroups: ['back'], difficulty: 'beginner', equipment: 'dumbbell', description: '', defaultSets: 3, defaultReps: 10, defaultRestSeconds: 60 }
    expect((await call('/api/exercises/submissions', { exercise })).body.status).toBe('pending')
    expect((await call('/api/exercises/submissions')).body.items).toHaveLength(1)
    expect((await call('/api/exercises/community')).body.items).toEqual([])
  })
})
