import { formatDate, formatNumber } from '@/shared/lib/formatters'
import type { PersonalRecord } from '../model/types'

export function RecordList({ records }: { records: PersonalRecord[] }) {
  const sorted = [...records].sort((a, b) => b.maxWeightKg - a.maxWeightKg)
  return (
    <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
      {sorted.map((record) => (
        <li key={record.exerciseId} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-fg">{record.exerciseName}</span>
            <span className="text-xs text-fg-subtle">{formatDate(record.achievedAt)}</span>
          </span>
          <span className="shrink-0 text-right font-mono tabular">
            <span className="text-lg font-semibold text-fg">{formatNumber(record.maxWeightKg, 1)}</span>
            <span className="text-sm text-fg-subtle"> кг × {record.maxReps}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
