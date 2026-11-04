import { Check, RotateCcw } from 'lucide-react'
import type { PlanExercise } from '@/features/workoutPlan'
import { statusStyles } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { CompletedSet, PlannedSet } from '../../model/types'

const KIND_LABELS = { drop: 'дроп', failure: 'відмова' } as const

const formatSet = (reps: number, weight?: number) => `${weight ? `${weight} кг × ` : ''}${reps}`

function setNote(set: CompletedSet) {
  const notes = [set.kind && set.kind !== 'warmup' ? KIND_LABELS[set.kind] : null, set.rpe ? `RPE ${set.rpe}` : null].filter(Boolean)
  return notes.length > 0 ? notes.join(' · ') : null
}

interface Row {
  key: string
  marker: string
  planned: { reps: number; weight?: number }
  set?: CompletedSet
  current: boolean
  warmup: boolean
}

interface SetListProps {
  target: PlanExercise
  /** Working sets done */
  done: CompletedSet[]
  /** Warm-up sets planned and done, shown before the working ones */
  warmup?: PlannedSet[]
  warmupDone?: CompletedSet[]
  onUndo: () => void
}

export function SetList({ target, done, warmup = [], warmupDone = [], onUndo }: SetListProps) {
  const warmingUp = done.length === 0 && warmupDone.length < warmup.length
  const rows: Row[] = [
    ...warmup.map((planned, i) => ({
      key: `w${i}`,
      marker: 'Р',
      planned,
      set: warmupDone[i],
      current: warmingUp && i === warmupDone.length,
      warmup: true,
    })),
    ...Array.from({ length: target.sets }, (_, i) => ({
      key: `s${i}`,
      marker: String(i + 1),
      planned: { reps: target.reps, weight: target.weight },
      set: done[i],
      current: !warmingUp && i === done.length,
      warmup: false,
    })),
  ]
  // Undo removes the set logged last: the latest working set, or the latest warm-up before any
  const lastKey = done.length > 0 ? `s${done.length - 1}` : warmupDone.length > 0 ? `w${warmupDone.length - 1}` : null

  return (
    <ol className="divide-y divide-line rounded-lg border border-line bg-surface">
      {rows.map((row) => {
        const note = row.set && setNote(row.set)
        return (
          <li key={row.key} className={cn('flex min-h-12 items-center gap-3 px-4 py-2 text-sm', row.current && 'bg-accent-soft')}>
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs',
                row.set ? statusStyles.done : row.current ? statusStyles.current : statusStyles.idle,
                row.warmup && !row.set && 'border-dashed',
              )}
            >
              {row.set ? <Check className="size-3.5" aria-label={row.warmup ? 'розминку виконано' : 'виконано'} /> : row.marker}
            </span>
            <span className={cn('flex-1 font-mono tabular', row.set ? 'text-fg' : row.current ? 'text-fg-muted' : 'text-fg-subtle')}>
              {row.set ? formatSet(row.set.reps, row.set.weight) : formatSet(row.planned.reps, row.planned.weight)}
              {row.warmup && <span className="ml-2 font-sans text-xs text-fg-subtle">розминка</span>}
              {note && <span className="ml-2 font-sans text-xs text-fg-subtle">{note}</span>}
            </span>
            {row.key === lastKey && (
              <button
                type="button"
                onClick={onUndo}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-fg-subtle hover:text-fg"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Скасувати
              </button>
            )}
          </li>
        )
      })}
    </ol>
  )
}
