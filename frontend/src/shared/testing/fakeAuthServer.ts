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
export function installFakeAuthServer({ syncPage = 500 } = {}) {
  const PAGE = syncPage
  const users = new Map<string, FakeUser>()
  let signedIn: string | null = null
  let isOffline = false
  let seq = 0
  // Sync rows of the signed-in account: last write wins, seq is the cursor
  const syncRows = new Map<string, { kind: string; id: string; data: unknown; updatedAt: string; seq: number }>()
  let syncSeq = 0
  const syncCalls: { cursor: string; changes: { kind: string; id: string; data: unknown; updatedAt: string }[] }[] = []

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
      case '/api/sync': {
        if (!signedIn) return fail(401, 'UNAUTHORIZED', 'Потрібно увійти')
        syncCalls.push(body)
        const own = new Set<number>()
        const stale: { kind: string; id: string; data: unknown; updatedAt: string; seq: number }[] = []
        let applied = 0
        for (const change of body.changes) {
          const key = `${change.kind}:${change.id}`
          const current = syncRows.get(key)
          if (current && current.updatedAt >= change.updatedAt) {
            stale.push(current)
            continue
          }
          syncRows.set(key, { ...change, seq: ++syncSeq })
          own.add(syncSeq)
          applied++
        }
        const after = [...syncRows.values()].filter((r) => r.seq > Number(body.cursor)).sort((a, b) => a.seq - b.seq)
        const page = after.slice(0, PAGE)
        const cursor = page.length ? String(page.at(-1)!.seq) : body.cursor
        const rows = new Map([...stale, ...page.filter((r) => !own.has(r.seq))].map((r) => [`${r.kind}:${r.id}`, r]))
        const changes = [...rows.values()].map(({ seq: _seq, ...rest }) => rest)
        return json(200, { applied, cursor, hasMore: after.length > PAGE, changes })
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
    syncRows,
    syncCalls,
    /** Stores a row as if another device had synced it. */
    serverChange(change: { kind: string; id: string; data: unknown; updatedAt: string }) {
      syncRows.set(`${change.kind}:${change.id}`, { ...change, seq: ++syncSeq })
    },
    offline: (value = true) => {
      isOffline = value
    },
  }
}
