import type { MouseEvent } from 'react'
import { Heart } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/utils/cn'
import type { Exercise } from '../model/types'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '../model/types'

export interface ExerciseCardProps {
  exercise: Exercise
  isFavorite: boolean
  onToggleFavorite: (id: string, e: MouseEvent) => void
  onSelect: (exercise: Exercise) => void
}

const DIFFICULTY_VARIANT = { beginner: 'success', intermediate: 'warning', advanced: 'danger' } as const

export function ExerciseCard({ exercise, isFavorite, onToggleFavorite, onSelect }: ExerciseCardProps) {
  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-line bg-surface transition-colors hover:border-line-strong">
      <button
        type="button"
        onClick={() => onSelect(exercise)}
        className="flex flex-1 cursor-pointer flex-col gap-3 p-4 text-left sm:p-5"
      >
        <span className="pr-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          {MUSCLE_GROUP_LABELS[exercise.primaryMuscle] || exercise.primaryMuscle}
        </span>
        <span className="font-semibold leading-snug text-fg transition-colors group-hover:text-accent">{exercise.name}</span>
        <span className="line-clamp-2 text-sm text-fg-muted">{exercise.description}</span>
        <span className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          <Badge variant={DIFFICULTY_VARIANT[exercise.difficulty]} size="sm">
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </Badge>
          <Badge size="sm">{EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment}</Badge>
        </span>
      </button>

      <button
        type="button"
        onClick={(e) => onToggleFavorite(exercise.id, e)}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Прибрати «${exercise.name}» з обраного` : `Додати «${exercise.name}» в обране`}
        className={cn(
          'absolute right-2 top-2 flex size-10 cursor-pointer items-center justify-center rounded-md transition-colors',
          isFavorite ? 'text-danger' : 'text-fg-subtle hover:text-fg',
        )}
      >
        <Heart className={cn('size-[18px]', isFavorite && 'fill-current')} />
      </button>
    </article>
  )
}
