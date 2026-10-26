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
      const sanitizedReps = Math.max(1, Math.min(500, Math.round(Number(reps)) || targetReps))
      const sanitizedWeight =
        weight === '' || isNaN(Number(weight))
          ? undefined
          : Math.max(0, Math.min(1000, Number(weight)))

      onComplete(
        {
          reps: sanitizedReps,
          weight: sanitizedWeight,
          completedAt: new Date().toISOString(),
        },
        defaultRestSeconds,
      )
    }
  }

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isCompleted
          ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-500/40 shadow-sm'
          : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-950/70 dark:border-slate-800/80 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      {/* Set Number & target info */}
      <div className="flex items-center gap-3.5">
        <span
          className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 shadow-xs'
          }`}
        >
          {setNumber}
        </span>
        <div>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Підхід {setNumber}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ціль: <strong className="text-slate-700 dark:text-slate-300">{targetReps} повт</strong>
            {targetWeight ? ` • ${targetWeight} кг` : ''}
          </span>
        </div>
      </div>

      {/* Actual Inputs & Check action */}
      <div className="flex items-center gap-2.5 self-end sm:self-center">
        {/* Weight input */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <input
            type="number"
            disabled={isCompleted}
            min={0}
            max={500}
            step={0.5}
            placeholder="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-12 text-center text-xs font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
          />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">кг</span>
        </div>

        {/* Reps input */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <input
            type="number"
            disabled={isCompleted}
            min={1}
            max={200}
            placeholder="0"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            className="w-10 text-center text-xs font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
          />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">повт</span>
        </div>

        {/* Complete / Undo button */}
        <Button
          variant={isCompleted ? 'success' : 'primary'}
          size="sm"
          onClick={handleToggle}
          icon={isCompleted ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          className="px-4"
          title={isCompleted ? 'Скасувати фіксацію підходу' : 'Зафіксувати підхід'}
        >
          {isCompleted ? 'Готово' : 'Зроблено'}
        </Button>
      </div>
    </div>
  )
}
