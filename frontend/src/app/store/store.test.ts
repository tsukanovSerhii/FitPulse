import { describe, expect, it } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'
import { installFakeAuthServer } from '@/shared/testing/fakeAuthServer'

installMemoryStorage()
installFakeAuthServer()

const { store } = await import('./store')
const { loginUser, logout, registerUser } = await import('@/features/auth/model')
const { fetchProgress, logWorkoutAsync } = await import('@/features/progress/model')

const log = (id: string) => ({
  id,
  planName: 'Push',
  date: new Date().toISOString(),
  durationSeconds: 1800,
  totalSets: 3,
  totalReps: 24,
  totalVolumeKg: 1500,
  caloriesBurned: 200,
  exercises: [],
})

const historyIds = () => store.getState().progress.history.map((entry) => entry.id)

describe('store with several accounts', () => {
  it('keeps each account’s data apart and resets state on a change of user', async () => {
    await store.dispatch(registerUser({ name: 'Anna', email: 'anna@test.ua', password: 'secret123' }))
    await store.dispatch(fetchProgress())
    await store.dispatch(logWorkoutAsync(log('anna-log')))
    expect(historyIds()).toContain('anna-log')

    await store.dispatch(logout())
    expect(store.getState().progress.history).toEqual([])

    await store.dispatch(registerUser({ name: 'Bohdan', email: 'bohdan@test.ua', password: 'secret123' }))
    await store.dispatch(fetchProgress())
    expect(historyIds()).not.toContain('anna-log')

    await store.dispatch(logout())
    await store.dispatch(loginUser({ email: 'anna@test.ua', password: 'secret123', remember: true }))
    await store.dispatch(fetchProgress())
    expect(historyIds()).toContain('anna-log')
  })
})
