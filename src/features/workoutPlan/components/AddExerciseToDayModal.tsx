import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { WorkoutPlan, DayOfWeek, PlanExercise } from '../model/types'
import { DAY_LABELS } from '../model/types'
import type { Exercise } from '@/features/exercises/model/types'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

export interface AddExerciseToDayModalProps {
  isOpen: boolean
  onClose: () => void
  plan: WorkoutPlan | null
  day: DayOfWeek | null
  allExercises: Exercise[]
  onAddExercise: (planId: string, day: DayOfWeek, exercise: Omit<PlanExercise, 'id' | 'order'>) => void
  onRemoveExercise: (planId: string, day: DayOfWeek, exerciseId: string) => void
  onUpdateExercise: (
    planId: string,
    day: DayOfWeek,
    exerciseId: string,
    updates: Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds' | 'notes'>>,
  ) => void
}

export const AddExerciseToDayModal: React.FC<AddExerciseToDayModalProps> = ({
  isOpen,
  onClose,
  plan,
  day,
  allExercises,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
}) => {
  const [selectedExId, setSelectedExId] = useState<string>(allExercises[0]?.id || '')
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState<number | ''>('')
  const [restSeconds, setRestSeconds] = useState(60)
  const [notes, setNotes] = useState('')

  if (!plan || !day) return null

  const dayExercises = plan.schedule[day] || []

  // Map exercise ID to object
  const exerciseMap = new Map<string, Exercise>()
  allExercises.forEach((e) => exerciseMap.set(e.id, e))

  const handleExerciseSelectChange = (id: string) => {
    setSelectedExId(id)
    const ex = exerciseMap.get(id)
    if (ex) {
      setSets(ex.defaultSets)
      setReps(ex.defaultReps)
      setRestSeconds(ex.defaultRestSeconds)
    }
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExId) return

    onAddExercise(plan.id, day, {
      exerciseId: selectedExId,
      sets: Number(sets) || 3,
      reps: Number(reps) || 10,
      weight: weight === '' ? undefined : Number(weight),
      restSeconds: Number(restSeconds) || 60,
      notes: notes.trim() || undefined,
    })

    setNotes('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${plan.name} — ${DAY_LABELS[day]}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Existing exercises in this day */}
        <div>
          <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
            <span>Вправи на цей день ({dayExercises.length})</span>
          </h4>

          {dayExercises.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-slate-400 bg-surface/30">
              На цей день ще не призначено жодної вправи. Додайте вправу нижче.
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayExercises.map((pEx, index) => {
                const ex = exerciseMap.get(pEx.exerciseId)
                return (
                  <div
                    key={pEx.id}
                    className="p-3 bg-surface rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <h5 className="text-sm font-bold text-slate-100">
                          {ex ? ex.name : 'Вправа'}
                        </h5>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{pEx.sets} підходи по {pEx.reps} повторень</span>
                          {pEx.weight ? <span>• {pEx.weight} кг</span> : null}
                          <span>• {pEx.restSeconds}с відпочинок</span>
                        </div>
                        {pEx.notes && (
                          <p className="text-[11px] text-purple-300 italic mt-1">
                            Нотатка: {pEx.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="flex items-center gap-1.5 text-xs">
                        <input
                          type="number"
                          title="Вага (кг)"
                          placeholder="кг"
                          value={pEx.weight ?? ''}
                          onChange={(e) =>
                            onUpdateExercise(plan.id, day, pEx.id, {
                              weight: e.target.value === '' ? undefined : Number(e.target.value),
                            })
                          }
                          className="w-14 px-2 py-1 bg-card border border-border rounded-lg text-center text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>

                      <button
                        onClick={() => onRemoveExercise(plan.id, day, pEx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Видалити з дня"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add new exercise form */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-400" />
            Додати вправу до розкладу
          </h4>

          <form onSubmit={handleAdd} className="space-y-3 bg-surface/40 p-4 rounded-xl border border-border/80">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Оберіть вправу з каталогу
              </label>
              <select
                value={selectedExId}
                onChange={(e) => handleExerciseSelectChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {allExercises.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.primaryMuscle})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Input
                label="Сети"
                type="number"
                min={1}
                max={20}
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
              />
              <Input
                label="Повторення"
                type="number"
                min={1}
                max={200}
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
              />
              <Input
                label="Вага (кг, опція)"
                type="number"
                min={0}
                max={500}
                step={0.5}
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="напр. 60"
              />
              <Input
                label="Відпочинок (сек)"
                type="number"
                min={10}
                max={600}
                step={5}
                value={restSeconds}
                onChange={(e) => setRestSeconds(Number(e.target.value))}
              />
            </div>

            <Input
              label="Нотатка до виконання (необов'язково)"
              placeholder="Наприклад: з паузою внизу 1 сек"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                Додати до розкладу
              </Button>
            </div>
          </form>
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Готово
          </Button>
        </div>
      </div>
    </Modal>
  )
}
