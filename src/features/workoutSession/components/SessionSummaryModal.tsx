import React from 'react'
import { Trophy, Clock, Dumbbell, Flame, CheckCircle } from 'lucide-react'
import type { WorkoutHistoryLog } from '@/features/progress/model/types'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { formatDuration } from '@/utils/formatters'

export interface SessionSummaryModalProps {
  isOpen: boolean
  workoutLog: WorkoutHistoryLog | null
  onSave: () => void
  onDiscard: () => void
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  workoutLog,
  onSave,
  onDiscard,
}) => {
  if (!workoutLog) return null

  return (
    <Modal isOpen={isOpen} onClose={onDiscard} maxWidth="md">
      <div className="text-center space-y-5 py-2">
        {/* Trophy icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center shadow-xl shadow-amber-500/25 animate-bounce">
          <Trophy className="w-9 h-9" />
        </div>

        <div>
          <h3 className="text-2xl font-black text-slate-100">Чудова робота!</h3>
          <p className="text-xs text-slate-400 mt-1">
            Тренування «{workoutLog.planName}» успішно завершено!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3.5 bg-surface rounded-xl border border-border">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Тривалість
            </span>
            <span className="text-lg font-bold text-slate-100 font-mono">
              {formatDuration(workoutLog.durationSeconds)}
            </span>
          </div>

          <div className="p-3.5 bg-surface rounded-xl border border-border">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
              Загальний тоннаж
            </span>
            <span className="text-lg font-bold text-slate-100 font-mono">
              {workoutLog.totalVolumeKg.toLocaleString()} кг
            </span>
          </div>

          <div className="p-3.5 bg-surface rounded-xl border border-border">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Виконано сетів
            </span>
            <span className="text-lg font-bold text-slate-100 font-mono">
              {workoutLog.totalSets} підходів
            </span>
          </div>

          <div className="p-3.5 bg-surface rounded-xl border border-border">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Спалено калорій
            </span>
            <span className="text-lg font-bold text-slate-100 font-mono">
              ~{workoutLog.caloriesBurned} ккал
            </span>
          </div>
        </div>

        {/* Exercise breakdown preview */}
        <div className="text-left bg-surface/50 p-3 rounded-xl border border-border/60">
          <h5 className="text-xs font-semibold text-slate-300 mb-2">
            Вправи у цьому тренуванні ({workoutLog.exercises.length}):
          </h5>
          <div className="space-y-1 text-xs text-slate-400 max-h-36 overflow-y-auto">
            {workoutLog.exercises.map((ex) => (
              <div key={ex.exerciseId} className="flex justify-between items-center py-1 border-b border-border/40 last:border-0">
                <span className="text-slate-200">{ex.exerciseName}</span>
                <span className="text-sky-300 font-medium">
                  {ex.setsCompleted} сетів • {ex.totalReps} повт {ex.maxWeightKg ? `(${ex.maxWeightKg} кг)` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="ghost" onClick={onDiscard}>
            Не зберігати
          </Button>
          <Button variant="success" onClick={onSave} icon={<CheckCircle className="w-4 h-4" />}>
            Зберегти у прогрес
          </Button>
        </div>
      </div>
    </Modal>
  )
}
