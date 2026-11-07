import type { AdminUserDetail } from '@fitpulse/contracts'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi, useSession } from '../session.tsx'
import { DayBars } from '../ui/charts.tsx'
import { countryName, DEVICE_LABELS, formatDate, formatDay, formatMinutes, MODE_LABELS } from '../ui/format.ts'
import { Badge, Button, Card, ChartFigure, ErrorText, StatTile } from '../ui/kit.tsx'

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
  if (!user) return <p className="text-fg-subtle">Завантаження…</p>

  const merge = (row: Partial<AdminUserDetail>) => setData({ ...user, ...row })

  const initials = (user.name || user.email).split(/s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-lg font-bold text-accent">
          {initials}
        </span>
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold">{user.name || user.email}</h1>
          <p className="text-fg-muted">{user.email}</p>
          <div className="flex flex-wrap gap-2">
            {user.blockedAt ? <Badge tone="danger">Заблоковано</Badge> : <Badge tone="good">Активний</Badge>}
            <Badge tone={user.plan === 'pro' ? 'warn' : 'neutral'}>{user.plan === 'pro' ? 'Pro' : 'Безкоштовний'}</Badge>
            {user.country && <Badge tone="accent">{countryName(user.country)}</Badge>}
          </div>
        </div>
      </div>
      {actionError && <ErrorText>{actionError}</ErrorText>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="У застосунку за 7 днів" value={user.minutes7d} format={formatMinutes} />
        <StatTile label="За 30 днів" value={user.minutes30d} format={formatMinutes} />
        <StatTile label="Тренувань" value={user.workouts} />
        <StatTile label="Вимірів тіла" value={user.bodyEntries} />
      </div>

      <ChartFigure title="Хвилини в застосунку, 30 днів" columns={['День', 'Хвилини']} rows={user.activity.map((d) => [formatDay(d.day), d.minutes])}>
        <DayBars data={user.activity} series={{ key: 'minutes', label: 'Хвилини', color: 'var(--series-1)' }} height={160} />
      </ChartFigure>

      <Card title="Акаунт">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-fg-subtle">Зареєстровано</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-fg-subtle">Остання синхронізація</dt>
            <dd>{formatDate(user.lastSyncAt)}</dd>
          </div>
          <div>
            <dt className="text-fg-subtle">Відкритих сесій</dt>
            <dd>{user.activeSessions}</dd>
          </div>
          <div>
            <dt className="text-fg-subtle">Статус</dt>
            <dd>{user.blockedAt ? `Заблоковано ${formatDate(user.blockedAt)}` : 'Активний'}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Останні входи">
        <div className="overflow-x-auto">
          <table aria-label="Сесії" className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-fg-subtle">
              <tr>
                <th className="py-2 pr-4 font-medium">Пристрій</th>
                <th className="py-2 pr-4 font-medium">Режим</th>
                <th className="py-2 pr-4 font-medium">Місце</th>
                <th className="py-2 pr-4 font-medium">IP</th>
                <th className="py-2 pr-4 font-medium">Вхід</th>
                <th className="py-2 pr-4 font-medium">Остання активність</th>
              </tr>
            </thead>
            <tbody>
              {user.sessions.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="py-2 pr-4">{[s.deviceType && (DEVICE_LABELS[s.deviceType] ?? s.deviceType), s.os, s.browser].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="py-2 pr-4">{s.appMode ? (MODE_LABELS[s.appMode] ?? s.appMode) : '—'}</td>
                  <td className="py-2 pr-4">{[s.city, s.country && countryName(s.country)].filter(Boolean).join(', ') || '—'}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{s.ipPrefix ?? '—'}</td>
                  <td className="py-2 pr-4">{formatDate(s.createdAt)}</td>
                  <td className="py-2 pr-4">
                    {formatDate(s.lastSeenAt)} {s.active ? <Badge tone="good">активна</Badge> : <Badge>завершена</Badge>}
                  </td>
                </tr>
              ))}
              {user.sessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-2 text-fg-subtle">
                    Входів ще не було
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                className="rounded-lg border border-line px-2 py-1"
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
          <div className="space-y-2 border-t border-line pt-3">
            {confirming === 'delete' ? (
              <>
                <p className="text-sm">
                  Акаунт і всі дані зникнуть назавжди. Щоб підтвердити, введіть <b>{user.email}</b>:
                </p>
                <div className="flex flex-wrap gap-2">
                  <input aria-label="Email для підтвердження" className="rounded-lg border border-line px-2 py-1" value={typedEmail} onChange={(e) => setTypedEmail(e.target.value)} />
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
