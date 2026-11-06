import { afterEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'
import { installFakeAuthServer } from '@/shared/testing/fakeAuthServer'

installMemoryStorage()
const server = installFakeAuthServer()
const { store } = await import('./store')
const { startSync } = await import('./syncListeners')
startSync()
const { registerUser } = await import('@/features/auth/model')
const { logWorkoutAsync } = await import('@/features/progress/model')
const { runSync } = await import('@/features/sync/model')

const workout = {
  id: 'w-local',
  planName: 'Push',
  date: '2026-11-07T10:00:00.000Z',
  durationSeconds: 1800,
  totalSets: 3,
  totalReps: 24,
  totalVolumeKg: 1500,
  caloriesBurned: 200,
  exercises: [],
}

afterEach(() => {
  vi.useRealTimers()
})

describe('sync in the store', () => {
  it('a change is sent to the server two seconds later', async () => {
    await store.dispatch(registerUser({ name: 'Ira', email: 'ira@store-sync.ua', password: 'secret123' }))
    await vi.waitFor(() => expect(store.getState().sync.status).toBe('synced'))
    await store.dispatch(logWorkoutAsync(workout))
    // Not at once: edits in a burst become one sync
    expect(server.syncRows.has('workout:w-local')).toBe(false)
    await vi.waitFor(() => expect(server.syncRows.has('workout:w-local')).toBe(true), { timeout: 4000 })
  }, 10_000)

  it('what arrives from another device shows up in the app', async () => {
    server.serverChange({
      kind: 'plan',
      id: 'p-remote',
      data: { id: 'p-remote', name: 'З телефона', createdAt: '2026-11-07T09:00:00.000Z', updatedAt: '2026-11-07T09:00:00.000Z', schedule: {} },
      updatedAt: new Date().toISOString(),
    })
    await store.dispatch(runSync())
    await vi.waitFor(() => expect(store.getState().workoutPlan.plans.map((p) => p.id)).toContain('p-remote'))
    expect(store.getState().sync.status).toBe('synced')
  })
})
