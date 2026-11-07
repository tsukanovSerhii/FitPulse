import type { AuditPage as AuditData } from '@fitpulse/contracts'
import { useState } from 'react'
import { useApi } from '../session.tsx'
import { formatDate } from '../ui/format.ts'
import { Button, Card, ErrorText } from '../ui/kit.tsx'

const ACTIONS: Record<string, string> = {
  'user.block': 'Заблокував користувача',
  'user.unblock': 'Розблокував користувача',
  'user.plan': 'Змінив тариф',
  'user.delete': 'Видалив користувача',
  'staff.create': 'Додав співробітника',
  'staff.update': 'Змінив співробітника',
}

export function AuditPage() {
  const [page, setPage] = useState(1)
  const { data, error } = useApi<AuditData>(`/api/audit?page=${page}`)
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Журнал дій</h1>
      {error && <ErrorText>{error}</ErrorText>}
      <Card>
        <ul className="divide-y divide-gray-100 text-sm">
          {data?.items.map((entry) => (
            <li key={entry.id} className="py-2">
              <span className="text-gray-500">{formatDate(entry.createdAt)}</span> · <b>{entry.adminEmail ?? 'видалений співробітник'}</b> ·{' '}
              {ACTIONS[entry.action] ?? entry.action}
              {entry.details != null && <code className="ml-2 text-xs text-gray-500">{JSON.stringify(entry.details)}</code>}
            </li>
          ))}
          {data && data.items.length === 0 && <li className="py-2 text-gray-500">Поки порожньо</li>}
        </ul>
        <div className="flex gap-2">
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Новіші
          </Button>
          <Button disabled={!data?.hasMore} onClick={() => setPage((p) => p + 1)}>
            Старіші
          </Button>
        </div>
      </Card>
    </div>
  )
}
