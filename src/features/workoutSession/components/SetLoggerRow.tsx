import React, { useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import type { CompletedSet } from '../model/types'
import { Button } from '@/components/ui'

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
      className={`p-3.5 sm:p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isCompleted
          ? 'bg-accent-soft border-accent'
          : 'bg-surface-2 border-line hover:border-line-strong'
      }`}
    >
      {/* Set Number & target info */}
      <div className="flex items-center gap-3.5">
        <span
          className={`w-9 h-9 rounded-md font-black text-xs flex items-center justify-center shrink-0 ${
            isCompleted
              ? 'bg-accent-soft text-accent border border-accent/40'
              : 'bg-surface text-fg-muted border border-line'
          }`}
        >
          {setNumber}
        </span>
        <div>
          <span className="text-sm font-bold text-fg">Підхід {setNumber}</span>
          <span className="block text-xs text-fg-subtle mt-0.5">
            Ціль: <strong className="text-fg-muted">{targetReps} повт</strong>
            {targetWeight ? ` • ${targetWeight} кг` : ''}
          </span>
        </div>
      </div>

      {/* Actual Inputs & Check action */}
      <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:w-auto sm:gap-2.5">
        {/* Weight input */}
        <label className="flex h-9 min-w-0 items-center gap-1 rounded-md border border-line bg-surface-2 px-3 focus-within:border-accent">
          <span className="sr-only">Вага, підхід {setNumber}</span>
          <input
            type="number"
            inputMode="decimal"
            disabled={isCompleted}
            min={0}
            max={500}
            step={0.5}
            placeholder="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full min-w-0 bg-transparent text-center font-mono text-sm font-semibold text-fg tabular focus:outline-none sm:w-12"
          />
          <span className="text-[11px] font-semibold text-fg-subtle" aria-hidden="true">кг</span>
        </label>

        {/* Reps input */}
        <label className="flex h-9 min-w-0 items-center gap-1 rounded-md border border-line bg-surface-2 px-3 focus-within:border-accent">
          <span className="sr-only">Повторення, підхід {setNumber}</span>
          <input
            type="number"
            inputMode="numeric"
            disabled={isCompleted}
            min={1}
            max={200}
            placeholder="0"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            className="w-full min-w-0 bg-transparent text-center font-mono text-sm font-semibold text-fg tabular focus:outline-none sm:w-10"
          />
          <span className="text-[11px] font-semibold text-fg-subtle" aria-hidden="true">повт</span>
        </label>

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
