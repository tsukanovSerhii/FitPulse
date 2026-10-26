import React from 'react'
import { Dumbbell, Flame, Clock, RefreshCw, CheckCircle2, Lightbulb, Heart } from 'lucide-react'
import type { Exercise } from '../model/types'
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS } from '../model/types'
import { Modal } from '@/components/common/Modal'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'

export interface ExerciseDetailModalProps {
  exercise: Exercise | null
  isOpen: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  if (!exercise) return null

  const difficultyVariant = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  } as const

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exercise.name} maxWidth="xl">
      <div className="space-y-6">
        {/* Muscle group & tags */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">
              Основний м'яз: {MUSCLE_GROUP_LABELS[exercise.primaryMuscle]}
            </Badge>
            <Badge variant={difficultyVariant[exercise.difficulty]}>
              {DIFFICULTY_LABELS[exercise.difficulty]}
            </Badge>
            <Badge variant="neutral">
              {EQUIPMENT_LABELS[exercise.equipment]}
            </Badge>
          </div>

          <Button
            variant={isFavorite ? 'danger' : 'outline'}
            size="sm"
            onClick={() => onToggleFavorite(exercise.id)}
            icon={<Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />}
          >
            {isFavorite ? 'В обраному' : 'В обране'}
          </Button>
        </div>

        {/* Short description */}
        <p className="text-sm text-slate-300 leading-relaxed bg-surface/40 p-3.5 rounded-xl border border-border/60">
          {exercise.description}
        </p>

        {/* Parameters Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-surface rounded-xl border border-border text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Підходи</span>
            <span className="text-base font-bold text-slate-100 flex items-center justify-center gap-1">
              <RefreshCw className="w-4 h-4 text-purple-400" />
              {exercise.defaultSets} сети
            </span>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-border text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Повторення</span>
            <span className="text-base font-bold text-slate-100 flex items-center justify-center gap-1">
              <Dumbbell className="w-4 h-4 text-indigo-400" />
              {exercise.defaultReps} разів
            </span>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-border text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Відпочинок</span>
            <span className="text-base font-bold text-slate-100 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-emerald-400" />
              {exercise.defaultRestSeconds} сек
            </span>
          </div>
        </div>

        {/* Steps / Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              Техніка виконання
            </h4>
            <div className="space-y-2">
              {exercise.instructions.map((step) => (
                <div
                  key={step.step}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-surface/50 border border-border/40 text-xs text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold flex items-center justify-center shrink-0">
                    {step.step}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {exercise.tips && exercise.tips.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-amber-300 mb-2.5 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Поради тренера
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-300 bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
              {exercise.tips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {exercise.calories && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-surface/50 p-3 rounded-xl border border-border/60">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Орієнтовне спалювання енергії: <strong>~{exercise.calories} ккал</strong> за хвилину інтенсивного виконання.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Закрити
          </Button>
        </div>
      </div>
    </Modal>
  )
}
