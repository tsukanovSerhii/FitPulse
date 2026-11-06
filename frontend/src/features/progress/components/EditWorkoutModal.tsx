import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { Button, IconButton, Modal } from '@/shared/ui'
import { applyLogEdit } from '../lib/editLog'
import type { ExerciseSummary, LoggedSet, WorkoutHistoryLog } from '../model/types'

export interface EditWorkoutModalProps {
  log: WorkoutHistoryLog
  onClose: () => void
  onSave: (log: WorkoutHistoryLog) => Promise<void>
}

const fieldClass =
  'h-10 w-full min-w-0 rounded-md border border-line bg-surface-2 text-center font-mono text-sm text-fg tabular focus:border-accent focus:outline-none'

function NumberField({ label, value, onChange, step = 1, optional = false }: { label: string; value?: number; onChange: (value: number | undefined) => void; step?: number; optional?: boolean }) {
  return (
    <input
      type="number"
      inputMode={step < 1 ? 'decimal' : 'numeric'}
      min={0}
      step={step}
      aria-label={label}
      placeholder={optional ? '—' : '0'}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)))}
      className={fieldClass}
    />
  )
}

/** Fixes a finished workout: sets of each exercise, or the totals of older entries that have no sets. */
export function EditWorkoutModal({ log, onClose, onSave }: EditWorkoutModalProps) {
  const [exercises, setExercises] = useState<ExerciseSummary[]>(log.exercises)
  const [minutes, setMinutes] = useState(Math.round(log.durationSeconds / 60))
  const [saving, setSaving] = useState(false)

  const update = (index: number, patch: Partial<ExerciseSummary>) => setExercises((list) => list.map((e, i) => (i === index ? { ...e, ...patch } : e)))
  const updateSet = (index: number, setIndex: number, patch: Partial<LoggedSet>) =>
    update(index, { sets: exercises[index].sets!.map((s, i) => (i === setIndex ? { ...s, ...patch } : s)) })

  const save = async () => {
    setSaving(true)
    try {
      await onSave(applyLogEdit(log, { ...log, exercises, durationSeconds: Math.max(1, minutes) * 60 }))
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      eyebrow="Редагування"
      title={log.dayLabel || log.planName}
      subtitle="Рекорди й тоннаж буде перераховано після збереження."
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Скасувати
          </Button>
          <Button onClick={save} disabled={saving}>
            Зберегти
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <label className="flex items-center justify-between gap-4 text-sm text-fg">
          Тривалість, хв
          <span className="w-24">
            <NumberField label="Тривалість, хв" value={minutes} onChange={(v) => setMinutes(v ?? 0)} />
          </span>
        </label>

        {exercises.map((exercise, index) => (
          <section key={exercise.exerciseId} aria-label={exercise.exerciseName} className="space-y-3 rounded-lg border border-line p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-sans text-sm font-semibold normal-case tracking-normal text-fg">{exercise.exerciseName}</h3>
              <IconButton
                size="sm"
                label={`Прибрати «${exercise.exerciseName}»`}
                icon={<Trash2 />}
                onClick={() => setExercises((list) => list.filter((_, i) => i !== index))}
                className="hover:text-danger"
              />
            </div>

            {exercise.sets ? (
              <ol className="space-y-2">
                <li className="grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_2.5rem] gap-2 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                  <span>№</span>
                  <span className="text-center">Вага, кг</span>
                  <span className="text-center">Повтори</span>
                </li>
                {exercise.sets.map((set, setIndex) => (
                  <li key={setIndex} className="grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_2.5rem] items-center gap-2">
                    <span className="font-mono text-xs text-fg-subtle">{setIndex + 1}</span>
                    <NumberField
                      label={`Підхід ${setIndex + 1}: вага`}
                      value={set.weight}
                      step={0.5}
                      optional
                      onChange={(weight) => updateSet(index, setIndex, { weight })}
                    />
                    <NumberField label={`Підхід ${setIndex + 1}: повтори`} value={set.reps} onChange={(reps) => updateSet(index, setIndex, { reps: reps ?? 0 })} />
                    <IconButton
                      size="sm"
                      label={`Видалити підхід ${setIndex + 1}`}
                      icon={<X />}
                      onClick={() => update(index, { sets: exercise.sets!.filter((_, i) => i !== setIndex) })}
                    />
                  </li>
                ))}
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Plus />}
                    onClick={() => update(index, { sets: [...exercise.sets!, { ...(exercise.sets!.at(-1) ?? { reps: 8 }) }] })}
                  >
                    Додати підхід
                  </Button>
                </li>
              </ol>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs text-fg-subtle">
                <label className="min-w-0 space-y-1">
                  <span>Підходів</span>
                  <NumberField label="Підходів" value={exercise.setsCompleted} onChange={(v) => update(index, { setsCompleted: v ?? 0 })} />
                </label>
                <label className="min-w-0 space-y-1">
                  <span>Повторів усього</span>
                  <NumberField label="Повторів усього" value={exercise.totalReps} onChange={(v) => update(index, { totalReps: v ?? 0 })} />
                </label>
                <label className="min-w-0 space-y-1">
                  <span>Найбільша вага, кг</span>
                  <NumberField label="Найбільша вага, кг" value={exercise.maxWeightKg} step={0.5} optional onChange={(v) => update(index, { maxWeightKg: v || undefined })} />
                </label>
                <label className="min-w-0 space-y-1">
                  <span>Повторів з нею</span>
                  <NumberField label="Повторів з найбільшою вагою" value={exercise.repsAtMaxWeight} optional onChange={(v) => update(index, { repsAtMaxWeight: v || undefined })} />
                </label>
              </div>
            )}
          </section>
        ))}

        {exercises.length === 0 && <p className="text-center text-sm text-fg-muted">У тренуванні не лишилось вправ. Щоб прибрати його повністю, видаліть запис.</p>}
      </div>
    </Modal>
  )
}
