import { useEffect, useState } from 'react'
import type { ExerciseSubmission, SubmissionStatus } from '@fitpulse/contracts'
import { Badge, Disclosure, type BadgeVariant } from '@/shared/ui'

const STATUS: Record<SubmissionStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'На перевірці', variant: 'warning' },
  approved: { label: 'Опубліковано', variant: 'success' },
  rejected: { label: 'Відхилено', variant: 'danger' },
}

export interface MySubmissionsProps {
  load: () => Promise<ExerciseSubmission[]>
  /** Changes after a new request, to load the list again */
  refreshKey?: number
}

/** The user's requests to publish an exercise for everyone, with the moderator's answer. Hidden while empty. */
export function MySubmissions({ load, refreshKey = 0 }: MySubmissionsProps) {
  const [items, setItems] = useState<ExerciseSubmission[]>([])

  useEffect(() => {
    let alive = true
    load()
      .then((list) => alive && setItems(list))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [load, refreshKey])

  if (items.length === 0) return null
  return (
    <Disclosure title={`Мої заявки · ${items.length}`}>
      <ul className="divide-y divide-line">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-start justify-between gap-2 py-2.5">
            <div className="min-w-0">
              <p className="font-medium text-fg">{item.exercise.name}</p>
              {item.status === 'rejected' && item.rejectReason && <p className="text-sm text-fg-muted">Причина: {item.rejectReason}</p>}
            </div>
            <Badge size="sm" variant={STATUS[item.status].variant}>
              {STATUS[item.status].label}
            </Badge>
          </li>
        ))}
      </ul>
    </Disclosure>
  )
}
