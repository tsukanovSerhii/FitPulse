import React, { useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import type { CompletedSet } from '../model/types'
import { Button } from '@/components/common/Button'

export interface SetLoggerRowProps {
  setNumber: number
  targetReps: number
  targetWeight?: number
  defaultRestSeconds: number
  completedSet?: CompletedSet
  onComplete: (set: CompletedSet, restSeconds: number) => void
  onRemove: () => void
}

export const SetLoggerRow: React.FC<SetLoggerRowProps> = ({
  setNumber,
  targetReps,
  targetWeight,
  defaultRestSeconds,
  completedSet,
  onComplete,
  onRemove,
}) => {
  const [reps, setReps] = useState<number>(completedSet?.reps ?? targetReps)
  const [weight, setWeight] = useState<number | ''>(
    completedSet?.weight ?? (targetWeight ?? ''),
  )

  const isCompleted = !!completedSet

  const handleToggle = () => {
    if (isCompleted) {
      onRemove()
    } else {
      onComplete(
        {
          reps: Number(reps) || targetReps,
          weight: weight === '' ? undefined : Number(weight),
          completedAt: new Date().toISOString(),
        },
        defaultRestSeconds,
      )
    }
  }

  return (
    <div
      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
        isCompleted
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : 'bg-surface/50 border-border hover:border-purple-500/30'
      }`}
    >
      {/* Set Number badge */}
      <div className="flex items-center gap-3">
        <span
          className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-surface text-slate-300 border border-border'
          }`}
        >
          {setNumber}
        </span>
        <div>
          <span className="text-xs font-semibold text-slate-200">Підхід {setNumber}</span>
          <span className="block text-[11px] text-slate-400">
            Ціль: {targetReps} повт {targetWeight ? `• ${targetWeight} кг` : ''}
          </span>
        </div>
      </div>

      {/* Inputs and Check action */}
      <div className="flex items-center gap-2">
        {/* Weight input */}
        <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-lg border border-border">
          <input
            type="number"
            disabled={isCompleted}
            min={0}
            max={500}
            step={0.5}
            placeholder="Вага"
            value={weight}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-12 text-center text-xs font-semibold text-slate-100 bg-transparent focus:outline-none"
          />
          <span className="text-[10px] text-slate-400">кг</span>
        </div>

        {/* Reps input */}
        <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-lg border border-border">
          <input
            type="number"
            disabled={isCompleted}
            min={1}
            max={200}
            placeholder="Повт"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            className="w-10 text-center text-xs font-semibold text-slate-100 bg-transparent focus:outline-none"
          />
          <span className="text-[10px] text-slate-400">повт</span>
        </div>

        {/* Complete / Undo button */}
        <Button
          variant={isCompleted ? 'success' : 'primary'}
          size="sm"
          onClick={handleToggle}
          icon={isCompleted ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          className="px-3"
          title={isCompleted ? 'Скасувати підхід' : 'Зафіксувати підхід'}
        >
          {isCompleted ? 'Готово' : 'Зроблено'}
        </Button>
      </div>
    </div>
  )
}
