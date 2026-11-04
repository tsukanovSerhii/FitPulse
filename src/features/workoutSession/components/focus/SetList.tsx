import { Check, RotateCcw } from 'lucide-react'
import type { PlanExercise } from '@/features/workoutPlan'
import { statusStyles } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { CompletedSet } from '../../model/types'

const KIND_LABELS = { drop: 'дроп', failure: 'відмова' } as const

const formatSet = (reps: number, weight?: number) => `${weight ? `${weight} кг × ` : ''}${reps}`

function setNote(set: CompletedSet) {
  const notes = [set.kind && set.kind !== 'warmup' ? KIND_LABELS[set.kind] : null, set.rpe ? `RPE ${set.rpe}` : null].filter(Boolean)
  return notes.length > 0 ? notes.join(' · ') : null
}

export function SetList({ target, done, onUndo }: { target: PlanExercise; done: CompletedSet[]; onUndo: () => void }) {
  return (
    <ol className="divide-y divide-line rounded-lg border border-line bg-surface">
      {Array.from({ length: target.sets }, (_, i) => {
        const set = done[i]
        const isCurrent = i === done.length
        const note = set && setNote(set)
        return (
          <li key={i} className={cn('flex min-h-12 items-center gap-3 px-4 py-2 text-sm', isCurrent && 'bg-accent-soft')}>
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs',
                set ? statusStyles.done : isCurrent ? statusStyles.current : statusStyles.idle,
              )}
            >
              {set ? <Check className="size-3.5" aria-label="виконано" /> : i + 1}
            </span>
            <span className={cn('flex-1 font-mono tabular', set ? 'text-fg' : isCurrent ? 'text-fg-muted' : 'text-fg-subtle')}>
              {set ? formatSet(set.reps, set.weight) : formatSet(target.reps, target.weight)}
              {note && <span className="ml-2 font-sans text-xs text-fg-subtle">{note}</span>}
            </span>
            {set && i === done.length - 1 && (
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
