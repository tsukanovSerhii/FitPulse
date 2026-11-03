import { Check, RotateCcw } from 'lucide-react'
import type { PlanExercise } from '@/features/workoutPlan'
import { statusStyles } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { CompletedSet } from '../../model/types'

const formatSet = (reps: number, weight?: number) => `${weight ? `${weight} кг × ` : ''}${reps}`

export function SetList({ target, done, onUndo }: { target: PlanExercise; done: CompletedSet[]; onUndo: () => void }) {
  return (
    <ol className="divide-y divide-line rounded-lg border border-line bg-surface">
      {Array.from({ length: target.sets }, (_, i) => {
        const set = done[i]
        const isCurrent = i === done.length
        return (
          <li key={i} className={cn('flex h-12 items-center gap-3 px-4 text-sm', isCurrent && 'bg-accent-soft')}>
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
