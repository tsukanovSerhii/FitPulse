import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatDate, formatNumber } from '@/shared/lib/formatters'
import type { PersonalRecord } from '../model/types'

export function RecordList({ records }: { records: PersonalRecord[] }) {
  const sorted = [...records].sort((a, b) => b.maxWeightKg - a.maxWeightKg)
  return (
    <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
      {sorted.map((record) => (
        <li key={record.exerciseId}>
          <Link
            to={`/progress/exercise/${record.exerciseId}`}
            className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2 sm:px-5"
          >
          <span className="min-w-0">
            <span className="block truncate font-semibold text-fg">{record.exerciseName}</span>
            <span className="text-xs text-fg-subtle">{formatDate(record.achievedAt)}</span>
          </span>
          <span className="ml-auto shrink-0 text-right font-mono tabular">
            <span className="text-lg font-semibold text-fg">{formatNumber(record.maxWeightKg, 1)}</span>
            <span className="text-sm text-fg-subtle"> кг × {record.maxReps}</span>
          </span>
          <ChevronRight className="-ml-2 size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
