import React from 'react'
import { Heart, Flame, Dumbbell, ChevronRight } from 'lucide-react'
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
      className="flex flex-col justify-between h-full group border-slate-800/80 bg-slate-900/80 hover:border-purple-500/40 transition-all p-5 shadow-lg"
    >
      <div>
        {/* Header: Muscle badge + Favorite heart */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="primary" dot size="sm">
            {MUSCLE_GROUP_LABELS[exercise.primaryMuscle] || exercise.primaryMuscle}
          </Badge>

          <button
            onClick={(e) => onToggleFavorite(exercise.id, e)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25 shadow-sm shadow-rose-500/20'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
            aria-label="Обране"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-2">
          {exercise.name}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-4">
          {exercise.description}
        </p>
      </div>

      {/* Footer / Meta info */}
      <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={difficultyBadgeVariant[exercise.difficulty]} size="sm">
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </Badge>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
            <Dumbbell className="w-3 h-3 text-purple-400" />
            {EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment}
          </span>
        </div>

        {exercise.calories ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold">
            <Flame className="w-3.5 h-3.5" />
            ~{exercise.calories} ккал
          </span>
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        )}
      </div>
    </Card>
  )
}
