import React from 'react'
import { Heart, Flame, Dumbbell } from 'lucide-react'
import type { Exercise } from '../model/types'
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS } from '../model/types'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'

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
      className="flex flex-col justify-between h-full group border-border/80 hover:border-purple-500/40 transition-all"
    >
      <div>
        {/* Header: Primary Muscle + Favorite toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="primary" size="sm">
            {MUSCLE_GROUP_LABELS[exercise.primaryMuscle] || exercise.primaryMuscle}
          </Badge>

          <button
            onClick={(e) => onToggleFavorite(exercise.id, e)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isFavorite
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                : 'bg-surface/60 border-border text-slate-400 hover:text-slate-200'
            }`}
            title={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
            aria-label="Обране"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-1 mb-2">
          {exercise.name}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {exercise.description}
        </p>
      </div>

      {/* Footer / Metas */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={difficultyBadgeVariant[exercise.difficulty]} size="sm">
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </Badge>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Dumbbell className="w-3 h-3 text-purple-400" />
            {EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment}
          </span>
        </div>

        {exercise.calories && (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
            <Flame className="w-3.5 h-3.5" />
            ~{exercise.calories} ккал/хв
          </span>
        )}
      </div>
    </Card>
  )
}
