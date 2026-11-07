import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'
import { installFakeAuthServer } from '@/shared/testing/fakeAuthServer'

const storage = installMemoryStorage()
const server = installFakeAuthServer({ syncPage: 2 })
const { registerUser } = await import('@/features/auth/model')
const { syncNow } = await import('./syncNow')
const { syncStatusText } = await import('../lib/statusText')
const { STORAGE_KEYS } = await import('@/shared/storage/localStorage')

let userId: string
const put = (key: string, value: unknown) => storage.local.set(`${key}:${userId}`, JSON.stringify(value))
const read = (key: string) => JSON.parse(storage.local.get(`${key}:${userId}`) ?? 'null')

beforeAll(async () => {
  // The thunk alone, without a store: features may not import the app
  const action = await registerUser({ name: 'Ira', email: 'ira@sync.ua', password: 'secret123' })(() => {}, () => ({}), undefined)
  userId = (action.payload as { id: string }).id
})

beforeEach(() => {
  server.offline(false)
  server.syncCalls.length = 0
})

describe('syncNow', () => {
  it('sends local changes once and nothing when nothing changed', async () => {
    put(STORAGE_KEYS.WORKOUT_HISTORY, [{ id: 'w1', date: '2026-11-01T10:00:00.000Z' }])
    await expect(syncNow()).resolves.toMatchObject({ status: 'synced' })
    expect(server.syncRows.has('workout:w1')).toBe(true)
    server.syncCalls.length = 0
    await syncNow()
    expect(server.syncCalls[0]!.changes).toEqual([])
  })

  it('offline keeps the changes and sends them next time', async () => {
    put(STORAGE_KEYS.BODY_LOG, [{ id: 'b1', date: '2026-11-02T10:00:00.000Z', weightKg: 70 }])
    server.offline(true)
    await expect(syncNow()).resolves.toMatchObject({ status: 'offline' })
    server.offline(false)
    await syncNow()
    expect(server.syncRows.get('body:b1')?.data).toMatchObject({ weightKg: 70 })
  })

  it('pages through everything the server has and reports what arrived', async () => {
    for (const id of ['s1', 's2', 's3']) server.serverChange({ kind: 'plan', id, data: { id, name: id }, updatedAt: '2026-11-03T10:00:00.000Z' })
    const result = await syncNow()
    expect(result).toMatchObject({ status: 'synced', received: true })
    expect(read(STORAGE_KEYS.WORKOUT_PLANS).map((p: { id: string }) => p.id).sort()).toEqual(['s1', 's2', 's3'])
    expect(server.syncCalls.length).toBeGreaterThan(1)
  })

  it('the newer setting from another device replaces the local one', async () => {
    put(STORAGE_KEYS.WEEKLY_GOAL, 3)
    await syncNow()
    server.serverChange({ kind: 'setting', id: STORAGE_KEYS.WEEKLY_GOAL, data: 5, updatedAt: new Date(Date.now() + 1000).toISOString() })
    await syncNow()
    expect(read(STORAGE_KEYS.WEEKLY_GOAL)).toBe(5)
  })
})

describe('safety', () => {
  afterEach(() => vi.useRealTimers())

  it('an edit made offline keeps the time it was made, not the time it reached the server', async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-11-02T08:00:00.000Z') })
    put(STORAGE_KEYS.MY_EQUIPMENT, ['dumbbell'])
    server.offline(true)
    await syncNow()
    vi.setSystemTime(new Date('2026-11-04T08:00:00.000Z'))
    server.offline(false)
    await syncNow()
    expect(server.syncRows.get(`setting:${STORAGE_KEYS.MY_EQUIPMENT}`)?.updatedAt).toBe('2026-11-02T08:00:00.000Z')
  })

  it('an unreadable storage key stops the sync instead of deleting everything on the server', async () => {
    put(STORAGE_KEYS.WORKOUT_HISTORY, [{ id: 'keep-1', date: '2026-11-01T10:00:00.000Z' }])
    await syncNow()
    storage.local.set(`${STORAGE_KEYS.WORKOUT_HISTORY}:${userId}`, '{not json')
    server.syncCalls.length = 0
    await expect(syncNow()).resolves.toMatchObject({ status: 'error' })
    expect(server.syncCalls).toHaveLength(0)
    expect(server.syncRows.get('workout:keep-1')?.data).not.toBeNull()
    put(STORAGE_KEYS.WORKOUT_HISTORY, [{ id: 'keep-1', date: '2026-11-01T10:00:00.000Z' }])
  })

  it('a sudden loss of most records is not sent as deletions', async () => {
    put(STORAGE_KEYS.BODY_LOG, Array.from({ length: 30 }, (_, i) => ({ id: `bulk-${i}`, date: '2026-11-01T10:00:00.000Z', weightKg: 70 })))
    await syncNow()
    put(STORAGE_KEYS.BODY_LOG, [])
    await expect(syncNow()).resolves.toMatchObject({ status: 'confirmDelete', count: 30 })
    expect(server.syncRows.get('body:bulk-0')?.data).not.toBeNull()
    // Once the user confirms, the deletions go through
    await expect(syncNow({ allowMassDelete: true })).resolves.toMatchObject({ status: 'synced' })
    expect(server.syncRows.get('body:bulk-0')?.data).toBeNull()
  })

  it('a record the server rejected is not sent again', async () => {
    put(STORAGE_KEYS.EXERCISE_NOTES, { 'ex-bench-press': 'x'.repeat(70 * 1024) })
    await syncNow()
    server.syncCalls.length = 0
    await syncNow()
    expect(server.syncCalls[0]!.changes.some((c) => c.id === STORAGE_KEYS.EXERCISE_NOTES)).toBe(false)
  })
})

describe('locks', () => {
  it('syncing takes its own lock, not the token refresh lock', async () => {
    const names: string[] = []
    const locks = { request: (name: string, run: () => Promise<unknown>) => (names.push(name), run()) }
    Object.defineProperty(globalThis, 'navigator', { value: { locks }, configurable: true })
    try {
      await syncNow()
    } finally {
      Object.defineProperty(globalThis, 'navigator', { value: undefined, configurable: true })
    }
    expect(names).toEqual(['fitpulse-sync'])
  })
})

describe('syncStatusText', () => {
  it('describes each state', () => {
    const now = new Date('2026-11-07T14:05:00')
    expect(syncStatusText({ status: 'synced', lastSyncedAt: now.toISOString() }, now)).toBe('Синхронізовано щойно')
    expect(syncStatusText({ status: 'synced', lastSyncedAt: new Date('2026-11-07T13:00:00').toISOString() }, now)).toBe('Синхронізовано о 13:00')
    expect(syncStatusText({ status: 'offline', lastSyncedAt: null }, now)).toBe('Очікує мережі')
    expect(syncStatusText({ status: 'error', lastSyncedAt: null }, now)).toBe('Помилка синхронізації')
    expect(syncStatusText({ status: 'confirmDelete', lastSyncedAt: null, pendingDeletes: 30 }, now)).toBe('На цьому пристрої зникли 30 записів. Видалити їх і на інших пристроях?')
  })
})
