import { vi } from 'vitest'

interface FakeUser {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

const json = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const fail = (status: number, code: string, message: string) => json(status, { error: { code, message } })

/**
 * Installs a fetch stub that answers /api/auth/* and /api/me like the real API, from memory.
 * Returns the users so tests can seed or inspect them, and `offline()` to make fetch fail.
 */
export function installFakeAuthServer() {
  const users = new Map<string, FakeUser>()
  let signedIn: string | null = null
  let isOffline = false
  let seq = 0

  const dto = (u: FakeUser) => ({ id: u.id, name: u.name, email: u.email, plan: 'free', createdAt: u.createdAt })
  const session = (u: FakeUser) => {
    signedIn = u.id
    return json(200, { accessToken: `token-${u.id}`, user: dto(u) })
  }

  const handle = async (url: string, init: RequestInit = {}) => {
    if (isOffline) throw new TypeError('Failed to fetch')
    const body = init.body ? JSON.parse(String(init.body)) : {}
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined
    const byEmail = () => [...users.values()].find((u) => u.email === email)

    switch (url) {
      case '/api/auth/register': {
        if (byEmail()) return fail(409, 'EMAIL_TAKEN', 'Акаунт з таким email уже існує')
        const id = `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`
        const user = { id, name: body.name.trim(), email: email!, password: body.password, createdAt: new Date().toISOString() }
        users.set(id, user)
        const res = session(user)
        return new Response(res.body, { status: 201, headers: res.headers })
      }
      case '/api/auth/login': {
        const user = byEmail()
        if (!user || user.password !== body.password) return fail(401, 'INVALID_CREDENTIALS', 'Невірний email або пароль')
        return session(user)
      }
      case '/api/auth/refresh': {
        const user = signedIn ? users.get(signedIn) : undefined
        return user ? session(user) : fail(401, 'SESSION_EXPIRED', 'Сесія завершилася. Увійдіть знову')
      }
      case '/api/auth/logout':
        signedIn = null
        return new Response(null, { status: 204 })
      case '/api/me': {
        const user = signedIn ? users.get(signedIn) : undefined
        if (!user) return fail(401, 'UNAUTHORIZED', 'Потрібно увійти')
        if (body.email && body.email !== user.email) {
          if (!body.currentPassword) return fail(400, 'VALIDATION_ERROR', 'Вкажіть поточний пароль')
          if (body.currentPassword !== user.password) return fail(401, 'INVALID_CREDENTIALS', 'Невірний email або пароль')
          user.email = body.email.trim().toLowerCase()
        }
        if (body.name) user.name = body.name.trim()
        return json(200, dto(user))
      }
      case '/api/auth/password/forgot':
      case '/api/auth/password/reset':
        return new Response(null, { status: 204 })
      default:
        return fail(404, 'NOT_FOUND', url)
    }
  }

  const fetchMock = vi.fn(handle)
  vi.stubGlobal('fetch', fetchMock)
  return {
    users,
    fetchMock,
    offline: (value = true) => {
      isOffline = value
    },
  }
}
