import type { AdminUserDetail } from '@fitpulse/contracts'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi, useSession } from '../session.tsx'
import { formatDate } from '../ui/format.ts'
import { Button, Card, ErrorText } from '../ui/kit.tsx'

export function UserPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { client, user: staff } = useSession()
  const { data: user, error, setData } = useApi<AdminUserDetail>(`/api/users/${id}`)
  const [confirming, setConfirming] = useState<'block' | 'delete' | null>(null)
  const [typedEmail, setTypedEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const isAdmin = staff.role === 'admin'

  const act = async (run: () => Promise<void>) => {
    setBusy(true)
    setActionError(null)
    try {
      await run()
      setConfirming(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Щось пішло не так')
    } finally {
      setBusy(false)
    }
  }

  if (error) return <ErrorText>{error}</ErrorText>
  if (!user) return <p className="text-gray-500">Завантаження…</p>

  const merge = (row: Partial<AdminUserDetail>) => setData({ ...user, ...row })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{user.name || user.email}</h1>
        <p className="text-gray-500">{user.email}</p>
      </div>
      {actionError && <ErrorText>{actionError}</ErrorText>}

      <Card title="Акаунт">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Статус</dt>
            <dd className={user.blockedAt ? 'font-semibold text-red-700' : ''}>{user.blockedAt ? 'Заблоковано' : 'Активний'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Тариф</dt>
            <dd>{user.plan === 'pro' ? 'Pro' : 'Безкоштовний'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Зареєстровано</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Тренувань</dt>
            <dd>{user.workouts}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Вимірів тіла</dt>
            <dd>{user.bodyEntries}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Остання синхронізація</dt>
            <dd>{formatDate(user.lastSyncAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Відкритих сесій</dt>
            <dd>{user.activeSessions}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Дії">
        <div className="flex flex-wrap items-center gap-3">
          {user.blockedAt ? (
            <Button disabled={busy} onClick={() => act(async () => merge(await client.request(`/api/users/${user.id}/unblock`, { method: 'POST', body: {} })))}>
              Розблокувати
            </Button>
          ) : confirming === 'block' ? (
            <>
              <span className="text-sm">Користувача буде виведено з усіх пристроїв.</span>
              <Button
                tone="danger"
                disabled={busy}
                onClick={() => act(async () => merge({ ...(await client.request<Partial<AdminUserDetail>>(`/api/users/${user.id}/block`, { method: 'POST', body: {} })), activeSessions: 0 }))}
              >
                Так, заблокувати
              </Button>
              <Button onClick={() => setConfirming(null)}>Скасувати</Button>
            </>
          ) : (
            <Button onClick={() => setConfirming('block')}>Заблокувати</Button>
          )}

          {isAdmin && (
            <label className="flex items-center gap-2 text-sm">
              Тариф
              <select
                aria-label="Тариф"
                className="rounded-md border border-gray-300 px-2 py-1"
                value={user.plan}
                disabled={busy}
                onChange={(e) => {
                  const plan = e.target.value
                  void act(async () => merge(await client.request(`/api/users/${user.id}`, { method: 'PATCH', body: { plan } })))
                }}
              >
                <option value="free">Безкоштовний</option>
                <option value="pro">Pro</option>
              </select>
            </label>
          )}
        </div>

        {isAdmin && (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            {confirming === 'delete' ? (
              <>
                <p className="text-sm">
                  Акаунт і всі дані зникнуть назавжди. Щоб підтвердити, введіть <b>{user.email}</b>:
                </p>
                <div className="flex flex-wrap gap-2">
                  <input aria-label="Email для підтвердження" className="rounded-md border border-gray-300 px-2 py-1" value={typedEmail} onChange={(e) => setTypedEmail(e.target.value)} />
                  <Button
                    tone="danger"
                    disabled={busy || typedEmail.trim().toLowerCase() !== user.email}
                    onClick={() =>
                      act(async () => {
                        await client.request(`/api/users/${user.id}`, { method: 'DELETE' })
                        navigate('/users', { replace: true })
                      })
                    }
                  >
                    Видалити назавжди
                  </Button>
                  <Button onClick={() => setConfirming(null)}>Скасувати</Button>
                </div>
              </>
            ) : (
              <Button tone="danger" onClick={() => setConfirming('delete')}>
                Видалити акаунт
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
