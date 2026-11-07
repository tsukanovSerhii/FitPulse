import type { UserList } from '@fitpulse/contracts'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../session.tsx'
import { formatDate } from '../ui/format.ts'
import { Button, Card, ErrorText } from '../ui/kit.tsx'

type Status = 'all' | 'active' | 'blocked'

export function UsersPage() {
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
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select aria-label="Статус" className="rounded-md border border-gray-300 px-3 py-2" value={status} onChange={(e) => {
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
        <p className="text-sm text-gray-500">Знайдено: {data?.total ?? '…'}</p>
        <ul className="divide-y divide-gray-100">
          {data?.items.map((user) => (
            <li key={user.id}>
              <Link to={`/users/${user.id}`} className="flex flex-wrap items-center justify-between gap-2 py-2 hover:bg-gray-50">
                <span>
                  <span className="font-medium">{user.name || '—'}</span> <span className="text-gray-500">{user.email}</span>
                </span>
                <span className="text-xs text-gray-500">
                  {user.plan === 'pro' && <span className="mr-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">Pro</span>}
                  {user.blockedAt && <span className="mr-2 rounded bg-red-100 px-1.5 py-0.5 text-red-700">Заблоковано</span>}
                  {formatDate(user.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
