import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Section } from '@/shared/ui'
import { recordExerciseIds } from '../lib/journal'
import type { PersonalRecord, WorkoutHistoryLog } from '../model/types'
import { JournalEntry } from './JournalEntry'

interface RecentWorkoutsProps {
  history: WorkoutHistoryLog[]
  records: Record<string, PersonalRecord>
  onDelete: (id: string) => void
  limit?: number
}

export function RecentWorkouts({ history, records, onDelete, limit = 3 }: RecentWorkoutsProps) {
  const latest = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
  return (
    <Section
      title="Останні тренування"
      aside={
        <Link to="/progress/journal" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover">
          Весь журнал <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
        {latest.map((log) => (
          <JournalEntry key={log.id} log={log} records={recordExerciseIds(log, records)} onDelete={onDelete} />
        ))}
      </ul>
    </Section>
  )
}
