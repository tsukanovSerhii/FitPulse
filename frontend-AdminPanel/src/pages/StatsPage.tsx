import type { AdminStats } from '@fitpulse/contracts'
import { useApi } from '../session.tsx'
import { ErrorText } from '../ui/kit.tsx'

const TILES: { key: keyof AdminStats; label: string }[] = [
  { key: 'users', label: 'Користувачів' },
  { key: 'newUsers7d', label: 'Нових за 7 днів' },
  { key: 'newUsers30d', label: 'Нових за 30 днів' },
  { key: 'activeUsers7d', label: 'Активних за 7 днів' },
  { key: 'workouts', label: 'Тренувань усього' },
  { key: 'workouts7d', label: 'Тренувань за 7 днів' },
  { key: 'proUsers', label: 'Pro' },
  { key: 'blockedUsers', label: 'Заблоковано' },
]

export function StatsPage() {
  const { data, error } = useApi<AdminStats>('/api/stats')
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Огляд</h1>
      {error && <ErrorText>{error}</ErrorText>}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TILES.map(({ key, label }) => (
          <div key={key} className="rounded-lg border border-gray-200 bg-white p-4">
            <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
            <dd className="mt-1 text-2xl font-bold">{data ? data[key] : '…'}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-gray-500">«Активні» — синхронізували дані за останній тиждень.</p>
    </div>
  )
}
