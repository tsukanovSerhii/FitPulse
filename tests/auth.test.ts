import { beforeEach, describe, expect, it } from 'vitest'

const memory = new Map<string, string>()
globalThis.window = {
  localStorage: {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => memory.set(k, String(v)),
    removeItem: (k: string) => memory.delete(k),
    clear: () => memory.clear(),
    length: 0,
    key: () => null,
  },
} as unknown as Window & typeof globalThis

const { authApi } = await import('@/features/auth/api/authApi')
const { passwordStrength, validateRegistration } = await import('@/features/auth/lib/validation')
const { avatarShapes } = await import('@/utils/avatar')
const { STORAGE_KEYS } = await import('@/services/storage/localStorage')

describe('authApi', () => {
  beforeEach(() => memory.clear())

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
    await expect(authApi.login({ email: 'ira@mail.com', password: 'wrong123' })).rejects.toThrow('Невірний')
    expect((await authApi.login({ email: 'IRA@mail.com', password: 'secret123' })).email).toBe('ira@mail.com')
  })
})

describe('validation', () => {
  it('requires name, email and a password with letters and digits', () => {
    expect(validateRegistration({ name: 'A', email: 'bad', password: 'short' })).toEqual({
      name: expect.any(String),
      email: expect.any(String),
      password: expect.any(String),
    })
    expect(validateRegistration({ name: 'Ira', email: 'ira@mail.com', password: 'onlyletters' }).password).toBeDefined()
    expect(validateRegistration({ name: 'Ira', email: 'ira@mail.com', password: 'secret123' })).toEqual({})
  })

  it('scores password strength', () => {
    expect(passwordStrength('')).toBe(0)
    expect(passwordStrength('secret123')).toBe(2)
    expect(passwordStrength('Secret123!')).toBe(4)
  })
})

describe('avatarShapes', () => {
  it('is deterministic per seed', () => {
    expect(avatarShapes('abc')).toEqual(avatarShapes('abc'))
    expect(avatarShapes('abc')).not.toEqual(avatarShapes('abd'))
  })
})
