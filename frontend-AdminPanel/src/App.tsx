import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Activity, ClipboardCheck, LayoutDashboard, LogOut, ScrollText, Shield, Users } from 'lucide-react'
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { createAdminClient, type AdminUser } from './api/client.ts'
import { fetchApiHealth, type ApiStatus } from './api/health.ts'
import { LoginForm } from './auth/LoginForm.tsx'
import { SessionContext } from './session.tsx'

// Pages, and the chart library with them, load after sign-in
const StatsPage = lazy(() => import('./pages/StatsPage.tsx').then((m) => ({ default: m.StatsPage })))
const UsersPage = lazy(() => import('./pages/UsersPage.tsx').then((m) => ({ default: m.UsersPage })))
const UserPage = lazy(() => import('./pages/UserPage.tsx').then((m) => ({ default: m.UserPage })))
const StaffPage = lazy(() => import('./pages/StaffPage.tsx').then((m) => ({ default: m.StaffPage })))
const ModerationPage = lazy(() => import('./pages/ModerationPage.tsx').then((m) => ({ default: m.ModerationPage })))
const AuditPage = lazy(() => import('./pages/AuditPage.tsx').then((m) => ({ default: m.AuditPage })))

const STATUS_TEXT: Record<ApiStatus | 'loading', string> = {
  loading: 'API: перевіряємо…',
  ok: 'API: працює',
  down: 'API: недоступне',
}

const ROLE_LABEL: Record<AdminUser['role'], string> = { admin: 'адміністратор', manager: 'менеджер' }

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-accent-soft text-accent' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'}`

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
    <p role="status" className={`text-xs ${status === 'down' ? 'text-danger' : 'text-fg-subtle'}`}>
      {STATUS_TEXT[status]}
    </p>
  )

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-white">
            <Activity className="size-5" aria-hidden />
          </span>
          <h1 className="text-2xl font-bold">FitPulse Admin</h1>
        </div>
        {user === null && <LoginForm onSubmit={async (email, password) => setUser(await client.login(email, password))} />}
        {statusLine}
      </main>
    )
  }

  return (
    <SessionContext.Provider value={{ client, user }}>
      <BrowserRouter>
        <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
          <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
            <div className="flex h-full flex-col gap-4 p-4">
              <div className="flex items-center gap-2 px-1">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-white">
                  <Activity className="size-4" aria-hidden />
                </span>
                <span className="text-lg font-bold">FitPulse Admin</span>
              </div>
              <nav aria-label="Розділи" className="flex gap-1 overflow-x-auto lg:flex-col">
                <NavLink to="/" end className={navClass}>
                  <LayoutDashboard className="size-4" aria-hidden /> Огляд
                </NavLink>
                <NavLink to="/users" className={navClass}>
                  <Users className="size-4" aria-hidden /> Користувачі
                </NavLink>
                <NavLink to="/moderation" className={navClass}>
                  <ClipboardCheck className="size-4" aria-hidden /> Модерація
                </NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/staff" className={navClass}>
                    <Shield className="size-4" aria-hidden /> Співробітники
                  </NavLink>
                )}
                <NavLink to="/audit" className={navClass}>
                  <ScrollText className="size-4" aria-hidden /> Журнал
                </NavLink>
              </nav>
              <div className="space-y-3 border-t border-line pt-4 text-sm lg:mt-auto">
                <p className="text-fg-muted">
                  Ви увійшли як {user.email} ({ROLE_LABEL[user.role]})
                </p>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-fg-muted hover:bg-surface-2 hover:text-fg"
                  onClick={async () => {
                    await client.logout()
                    setUser(null)
                  }}
                >
                  <LogOut className="size-4" aria-hidden /> Вийти
                </button>
                {statusLine}
              </div>
            </div>
          </aside>
          <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 lg:px-8">
            <Suspense fallback={<p className="text-fg-subtle">Завантаження…</p>}>
            <Routes>
              <Route path="/" element={<StatsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:id" element={<UserPage />} />
              {user.role === 'admin' && <Route path="/staff" element={<StaffPage />} />}
              <Route path="/moderation" element={<ModerationPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </SessionContext.Provider>
  )
}
