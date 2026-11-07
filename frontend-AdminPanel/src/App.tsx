import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { createAdminClient, type AdminUser } from './api/client.ts'
import { fetchApiHealth, type ApiStatus } from './api/health.ts'
import { LoginForm } from './auth/LoginForm.tsx'
import { AuditPage } from './pages/AuditPage.tsx'
import { StaffPage } from './pages/StaffPage.tsx'
import { StatsPage } from './pages/StatsPage.tsx'
import { UserPage } from './pages/UserPage.tsx'
import { UsersPage } from './pages/UsersPage.tsx'
import { SessionContext } from './session.tsx'

const STATUS_TEXT: Record<ApiStatus | 'loading', string> = {
  loading: 'API: перевіряємо…',
  ok: 'API: працює',
  down: 'API: недоступне',
}

const ROLE_LABEL: Record<AdminUser['role'], string> = { admin: 'адміністратор', manager: 'менеджер' }

const navClass = ({ isActive }: { isActive: boolean }) => `rounded px-2 py-1 ${isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`

export function App({ fetchFn = fetch }: { fetchFn?: typeof fetch }) {
  const client = useMemo(() => createAdminClient(fetchFn), [fetchFn])
  const [status, setStatus] = useState<ApiStatus | 'loading'>('loading')
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    fetchApiHealth(fetchFn).then((result) => active && setStatus(result))
    client.restore().then((restored) => active && setUser(restored))
    return () => {
      active = false
    }
  }, [client, fetchFn])

  const statusLine = (
    <p role="status" className={status === 'down' ? 'text-red-600' : 'text-gray-600'}>
      {STATUS_TEXT[status]}
    </p>
  )

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6 font-sans">
        <h1 className="text-3xl font-bold">FitPulse Admin</h1>
        {user === null && <LoginForm onSubmit={async (email, password) => setUser(await client.login(email, password))} />}
        {statusLine}
      </main>
    )
  }

  return (
    <SessionContext.Provider value={{ client, user }}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
              <h1 className="text-lg font-bold">FitPulse Admin</h1>
              <nav aria-label="Розділи" className="flex flex-wrap gap-1 text-sm">
                <NavLink to="/" end className={navClass}>
                  Огляд
                </NavLink>
                <NavLink to="/users" className={navClass}>
                  Користувачі
                </NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/staff" className={navClass}>
                    Співробітники
                  </NavLink>
                )}
                <NavLink to="/audit" className={navClass}>
                  Журнал
                </NavLink>
              </nav>
              <div className="ml-auto flex items-center gap-3 text-sm">
                <span>
                  Ви увійшли як {user.email} ({ROLE_LABEL[user.role]})
                </span>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-3 py-1"
                  onClick={async () => {
                    await client.logout()
                    setUser(null)
                  }}
                >
                  Вийти
                </button>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
            <Routes>
              <Route path="/" element={<StatsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:id" element={<UserPage />} />
              {user.role === 'admin' && <Route path="/staff" element={<StaffPage />} />}
              <Route path="/audit" element={<AuditPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {statusLine}
          </main>
        </div>
      </BrowserRouter>
    </SessionContext.Provider>
  )
}
