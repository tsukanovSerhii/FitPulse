import React from 'react'
import { Heart, Flame, Dumbbell, ChevronRight } from 'lucide-react'
import type { Exercise } from '../model/types'
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS } from '../model/types'
import { Card } from '@/components/ui'
import { Badge } from '@/components/ui'

export interface ExerciseCardProps {
  exercise: Exercise
  isFavorite: boolean
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  onSelect: (exercise: Exercise) => void
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const difficultyBadgeVariant = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  } as const

  return (
    <Card
      hover
      onClick={() => onSelect(exercise)}
      className="flex flex-col justify-between h-full group p-6"
    >
      <div>
        {/* Header: Muscle badge + Favorite heart */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <Badge variant="primary" dot size="sm">
            {MUSCLE_GROUP_LABELS[exercise.primaryMuscle] || exercise.primaryMuscle}
          </Badge>

          <button
            onClick={(e) => onToggleFavorite(exercise.id, e)}
            className={`p-2 rounded-lg border transition-all duration-300 cursor-pointer ${
              isFavorite
                ? 'bg-danger-soft border-danger/40 text-danger'
                : 'bg-surface-2 border-line text-fg-subtle hover:text-fg hover:bg-surface-2'
            }`}
            title={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
            aria-label="Обране"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-danger text-danger' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-fg group-hover:text-accent transition-colors line-clamp-1 mb-2">
          {exercise.name}
        </h4>

        {/* Description */}
        <p className="text-xs text-fg-muted leading-relaxed line-clamp-2 mb-4 font-medium">
          {exercise.description}
        </p>
      </div>

      {/* Footer / Meta info */}
      <div className="pt-4 border-t border-line flex items-center justify-between text-xs text-fg-muted">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={difficultyBadgeVariant[exercise.difficulty]} size="sm">
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </Badge>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-fg-muted bg-surface-2 px-2.5 py-1 rounded-full border border-line">
            <Dumbbell className="w-3 h-3 text-accent" />
            {EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment}
          </span>
        </div>

        {exercise.calories ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-warning font-black">
            <Flame className="w-3.5 h-3.5" />
            ~{exercise.calories} ккал
          </span>
        ) : (
          <ChevronRight className="w-4 h-4 text-fg-subtle group-hover:text-accent group-hover:translate-x-1 transition-all" />
        )}
      </div>
    </Card>
  )
}
