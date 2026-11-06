import { useEffect, useMemo, useState } from 'react'
import { createAdminClient, type AdminUser } from './api/client.ts'
import { fetchApiHealth, type ApiStatus } from './api/health.ts'
import { LoginForm } from './auth/LoginForm.tsx'

const STATUS_TEXT: Record<ApiStatus | 'loading', string> = {
  loading: 'API: перевіряємо…',
  ok: 'API: працює',
  down: 'API: недоступне',
}

const ROLE_LABEL: Record<AdminUser['role'], string> = { admin: 'адміністратор', manager: 'менеджер' }

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

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6 font-sans">
      <h1 className="text-3xl font-bold">FitPulse Admin</h1>
      {user === undefined ? null : user ? (
        <section className="space-y-4">
          <p>
            Ви увійшли як {user.email} ({ROLE_LABEL[user.role]})
          </p>
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2"
            onClick={async () => {
              await client.logout()
              setUser(null)
            }}
          >
            Вийти
          </button>
        </section>
      ) : (
        <LoginForm onSubmit={async (email, password) => setUser(await client.login(email, password))} />
      )}
      <p role="status" className={status === 'down' ? 'text-red-600' : 'text-gray-600'}>
        {STATUS_TEXT[status]}
      </p>
    </main>
  )
}
