import type { UserList } from '@fitpulse/contracts'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../session.tsx'

import { countryName, formatDate } from '../ui/format.ts'
import { Badge, Button, Card, ErrorText } from '../ui/kit.tsx'

type Status = 'all' | 'active' | 'blocked'

export function UsersPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState<Status>('all')
  const [page, setPage] = useState(1)

  // One request after typing stops, not one per key
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(query.trim())
      setPage(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const params = new URLSearchParams({ query: debounced, status, page: String(page) })
  const { data, error } = useApi<UserList>(`/api/users?${params}`)
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Користувачі</h1>
      <div className="flex flex-wrap gap-3">
        <input
          aria-label="Пошук за email або ім’ям"
          placeholder="Email або ім’я"
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select aria-label="Статус" className="rounded-lg border border-line bg-surface px-3 py-2" value={status} onChange={(e) => {
            setStatus(e.target.value as Status)
            setPage(1)
          }}>
          <option value="all">Усі</option>
          <option value="active">Активні</option>
          <option value="blocked">Заблоковані</option>
        </select>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      <Card>
        <p className="text-sm text-fg-subtle">Знайдено: {data?.total ?? '…'}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-fg-subtle">
              <tr>
                <th className="py-2 pr-4 font-medium">Користувач</th>
                <th className="py-2 pr-4 font-medium">Тариф</th>
                <th className="py-2 pr-4 font-medium">Статус</th>
                <th className="py-2 pr-4 font-medium">Країна</th>
                <th className="py-2 pr-4 font-medium">Зареєстровано</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((user) => (
                <tr key={user.id} className="cursor-pointer border-t border-line hover:bg-surface-2" onClick={() => navigate(`/users/${user.id}`)}>
                  <td className="py-2 pr-4">
                    <Link to={`/users/${user.id}`} className="block hover:underline">
                      <span className="font-medium">{user.name || '—'}</span> <span className="text-fg-muted">{user.email}</span>
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{user.plan === 'pro' ? <Badge tone="warn">Pro</Badge> : <Badge>Free</Badge>}</td>
                  <td className="py-2 pr-4">{user.blockedAt ? <Badge tone="danger">Заблоковано</Badge> : <Badge tone="good">Активний</Badge>}</td>
                  <td className="py-2 pr-4">{countryName(user.country)}</td>
                  <td className="py-2 pr-4 text-fg-muted">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center gap-3 text-sm">
            <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Назад
            </Button>
            <span>
              {page} з {pages}
            </span>
            <Button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Далі
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
