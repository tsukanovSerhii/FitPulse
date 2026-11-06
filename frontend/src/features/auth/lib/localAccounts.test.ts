import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'
import { installFakeAuthServer } from '@/shared/testing/fakeAuthServer'

const { local, session } = installMemoryStorage()
const server = installFakeAuthServer()

const { authApi } = await import('../api/authApi')
const { moveUserData } = await import('@/shared/storage/userStorage')
const { STORAGE_KEYS } = await import('@/shared/storage/localStorage')
const { createSalt, hashPassword } = await import('./password')

const LOCAL_ID = 'local-anna'
const history = [{ id: 'old-workout' }]

async function seedLocalAccount(password = 'oldpass1') {
  const salt = createSalt()
  local.set(
    STORAGE_KEYS.ACCOUNTS,
    JSON.stringify([
      { id: LOCAL_ID, name: 'Anna', email: 'anna@test.ua', plan: 'free', createdAt: '2026-01-01T00:00:00.000Z', salt, passwordHash: await hashPassword(password, salt), avatarUrl: 'data:image/png;base64,AAA' },
    ]),
  )
  local.set(`${STORAGE_KEYS.WORKOUT_HISTORY}:${LOCAL_ID}`, JSON.stringify(history))
}

const accounts = () => JSON.parse(local.get(STORAGE_KEYS.ACCOUNTS) ?? '[]')
const read = (key: string, id: string) => JSON.parse(local.get(`${key}:${id}`) ?? 'null')

beforeEach(() => {
  local.clear()
  session.clear()
  server.users.clear()
  server.offline(false)
})

describe('moveUserData', () => {
  it('move copies missing keys and keeps existing ones', () => {
    local.set(`${STORAGE_KEYS.WORKOUT_HISTORY}:a`, '["a"]')
    local.set(`${STORAGE_KEYS.BODY_LOG}:a`, '["body-a"]')
    local.set(`${STORAGE_KEYS.BODY_LOG}:b`, '["body-b"]')
    moveUserData('a', 'b')
    expect(read(STORAGE_KEYS.WORKOUT_HISTORY, 'b')).toEqual(['a'])
    expect(read(STORAGE_KEYS.BODY_LOG, 'b')).toEqual(['body-b'])
    expect(local.has(`${STORAGE_KEYS.WORKOUT_HISTORY}:a`)).toBe(false)
    expect(local.has(`${STORAGE_KEYS.BODY_LOG}:a`)).toBe(false)
  })
})

describe('adopting on-device accounts', () => {
  it('login with a matching local password registers on the server and adopts data', async () => {
    await seedLocalAccount()
    const user = await authApi.login({ email: 'Anna@test.ua', password: 'oldpass1', remember: true })
    expect(user.name).toBe('Anna')
    expect([...server.users.values()].map((u) => u.email)).toEqual(['anna@test.ua'])
    expect(read(STORAGE_KEYS.WORKOUT_HISTORY, user.id)).toEqual(history)
    expect(accounts()).toEqual([])
  })

  it('a wrong local password is still invalid', async () => {
    await seedLocalAccount()
    await expect(authApi.login({ email: 'anna@test.ua', password: 'nope1234', remember: true })).rejects.toMatchObject({
      message: 'Невірний email або пароль',
    })
    expect(server.users.size).toBe(0)
    expect(accounts()).toHaveLength(1)
  })

  it('EMAIL_TAKEN during adoption keeps local data and reports invalid credentials', async () => {
    await seedLocalAccount()
    server.users.set('srv', { id: 'srv', name: 'Anna', email: 'anna@test.ua', password: 'server-pass', createdAt: '2026-11-01T00:00:00.000Z' })
    await expect(authApi.login({ email: 'anna@test.ua', password: 'oldpass1', remember: true })).rejects.toMatchObject({
      message: 'Невірний email або пароль',
    })
    expect(accounts()).toHaveLength(1)
    expect(read(STORAGE_KEYS.WORKOUT_HISTORY, LOCAL_ID)).toEqual(history)
  })

  it('any successful sign-in adopts the local account with the same email', async () => {
    await seedLocalAccount()
    server.users.set('srv', { id: 'srv', name: 'Anna', email: 'anna@test.ua', password: 'server-pass', createdAt: '2026-11-01T00:00:00.000Z' })
    const user = await authApi.login({ email: 'anna@test.ua', password: 'server-pass', remember: true })
    expect(user.id).toBe('srv')
    expect(read(STORAGE_KEYS.WORKOUT_HISTORY, 'srv')).toEqual(history)
    expect(accounts()).toEqual([])
  })

  it('avatar moves into per-user data', async () => {
    await seedLocalAccount()
    const user = await authApi.login({ email: 'anna@test.ua', password: 'oldpass1', remember: true })
    expect(user.avatarUrl).toBe('data:image/png;base64,AAA')
    expect(read(STORAGE_KEYS.AVATAR, user.id)).toBe('data:image/png;base64,AAA')
  })

  it('registering with the email of a local account adopts its data', async () => {
    await seedLocalAccount()
    const user = await authApi.register({ name: 'Anna', email: 'anna@test.ua', password: 'newpass12' })
    expect(read(STORAGE_KEYS.WORKOUT_HISTORY, user.id)).toEqual(history)
  })
})
