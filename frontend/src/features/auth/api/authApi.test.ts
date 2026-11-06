import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'

const { local: memory, session: tabMemory } = installMemoryStorage()

const { authApi } = await import('./authApi')
const { STORAGE_KEYS } = await import('@/shared/storage/localStorage')

describe('authApi', () => {
  beforeEach(() => {
    memory.clear()
    tabMemory.clear()
  })

  it('registers, stores only a hash and starts a session', async () => {
    const user = await authApi.register({ name: ' Ira ', email: 'Ira@Mail.com', password: 'secret123' })
    expect(user).toMatchObject({ name: 'Ira', email: 'ira@mail.com', plan: 'free' })
    expect(memory.get(STORAGE_KEYS.ACCOUNTS)).not.toContain('secret123')
    expect(authApi.currentUser()?.id).toBe(user.id)
  })

  it('rejects duplicate emails', async () => {
    await authApi.register({ name: 'Ira', email: 'ira@mail.com', password: 'secret123' })
    await expect(authApi.register({ name: 'X', email: 'IRA@mail.com', password: 'secret123' })).rejects.toThrow('уже існує')
  })

  it('logs in with the right password only', async () => {
    await authApi.register({ name: 'Ira', email: 'ira@mail.com', password: 'secret123' })
    authApi.logout()
    expect(authApi.currentUser()).toBeNull()
    await expect(authApi.login({ email: 'ira@mail.com', password: 'wrong123', remember: true })).rejects.toThrow('Невірний')
    expect((await authApi.login({ email: 'IRA@mail.com', password: 'secret123', remember: true })).email).toBe('ira@mail.com')
  })

  it('keeps a not-remembered session in the tab only', async () => {
    const user = await authApi.register({ name: 'Ira', email: 'ira@mail.com', password: 'secret123' })
    authApi.logout()
    await authApi.login({ email: 'ira@mail.com', password: 'secret123', remember: false })
    expect(memory.has(STORAGE_KEYS.SESSION)).toBe(false)
    expect(authApi.currentUser()?.id).toBe(user.id)
    tabMemory.clear()
    expect(authApi.currentUser()).toBeNull()
  })
})
