import type { StaffMember } from '@fitpulse/contracts'
import { useState, type FormEvent } from 'react'
import { useApi, useSession } from '../session.tsx'
import { formatDate } from '../ui/format.ts'
import { Button, Card, ErrorText } from '../ui/kit.tsx'

const ROLE: Record<StaffMember['role'], string> = { admin: 'Адміністратор', manager: 'Менеджер' }

export function StaffPage() {
  const { client, user: me } = useSession()
  const { data, error, reload } = useApi<StaffMember[]>('/api/staff')
  const [form, setForm] = useState({ email: '', password: '', role: 'manager' as StaffMember['role'] })
  const [actionError, setActionError] = useState<string | null>(null)

  const run = async (action: () => Promise<unknown>) => {
    setActionError(null)
    try {
      await action()
      reload()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Щось пішло не так')
    }
  }

  const create = (event: FormEvent) => {
    event.preventDefault()
    void run(async () => {
      await client.request('/api/staff', { method: 'POST', body: form })
      setForm({ email: '', password: '', role: 'manager' })
    })
  }

  const field = 'rounded-lg border border-line px-3 py-2'
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Співробітники</h1>
      {(error || actionError) && <ErrorText>{error ?? actionError}</ErrorText>}
      <Card>
        <ul className="divide-y divide-line">
          {data?.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span>
                <span className="font-medium">{member.email}</span> · {ROLE[member.role]}
                {member.disabledAt && <span className="ml-2 rounded bg-surface-2 px-1.5 py-0.5 text-fg-muted">вимкнено</span>}
                <span className="ml-2 text-fg-subtle">з {formatDate(member.createdAt)}</span>
              </span>
              {member.id !== me.id && (
                <span className="flex gap-2">
                  <Button onClick={() => run(() => client.request(`/api/staff/${member.id}`, { method: 'PATCH', body: { role: member.role === 'admin' ? 'manager' : 'admin' } }))}>
                    {member.role === 'admin' ? 'Зробити менеджером' : 'Зробити адміністратором'}
                  </Button>
                  <Button onClick={() => run(() => client.request(`/api/staff/${member.id}`, { method: 'PATCH', body: { disabled: !member.disabledAt } }))}>
                    {member.disabledAt ? 'Увімкнути' : 'Вимкнути'}
                  </Button>
                </span>
              )}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Новий співробітник">
        <form onSubmit={create} className="flex flex-wrap gap-3">
          <input aria-label="Email" type="email" required className={field} placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input aria-label="Пароль" type="password" required minLength={12} className={field} placeholder="пароль, від 12 символів" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select aria-label="Роль" className={field} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffMember['role'] })}>
            <option value="manager">Менеджер</option>
            <option value="admin">Адміністратор</option>
          </select>
          <Button type="submit" tone="primary">
            Додати
          </Button>
        </form>
      </Card>
    </div>
  )
}
