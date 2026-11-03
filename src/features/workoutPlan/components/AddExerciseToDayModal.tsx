import { useMemo, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Exercise } from '@/features/exercises'
import { Button, IconButton, Input, Modal, Section, Select } from '@/shared/ui'
import type { DayOfWeek, PlanExercise, WorkoutPlan } from '../model/types'
import { DAY_LABELS } from '../model/types'

type ExerciseUpdates = Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds' | 'notes'>>

export interface AddExerciseToDayModalProps {
  isOpen: boolean
  onClose: () => void
  plan: WorkoutPlan | null
  day: DayOfWeek | null
  allExercises: Exercise[]
  onAddExercise: (planId: string, day: DayOfWeek, exercise: Omit<PlanExercise, 'id' | 'order'>) => void
  onRemoveExercise: (planId: string, day: DayOfWeek, exerciseId: string) => void
  onUpdateExercise: (planId: string, day: DayOfWeek, exerciseId: string, updates: ExerciseUpdates) => void
}

export function AddExerciseToDayModal({
  isOpen,
  onClose,
  plan,
  day,
  allExercises,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
}: AddExerciseToDayModalProps) {
  const [exerciseId, setExerciseId] = useState(allExercises[0]?.id ?? '')
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState<number | ''>('')
  const [restSeconds, setRestSeconds] = useState(60)
  const [notes, setNotes] = useState('')

  const exerciseMap = useMemo(() => new Map(allExercises.map((e) => [e.id, e])), [allExercises])
  const options = useMemo(() => allExercises.map((e) => ({ value: e.id, label: e.name })), [allExercises])

  if (!plan || !day) return null
  const dayExercises = plan.schedule[day] ?? []

  const pickExercise = (id: string) => {
    setExerciseId(id)
    const exercise = exerciseMap.get(id)
    if (exercise) {
      setSets(exercise.defaultSets)
      setReps(exercise.defaultReps)
      setRestSeconds(exercise.defaultRestSeconds)
    }
  }

  const handleAdd = (event: FormEvent) => {
    event.preventDefault()
    if (!exerciseId) return
    onAddExercise(plan.id, day, {
      exerciseId,
      sets: sets || 3,
      reps: reps || 10,
      weight: weight === '' ? undefined : weight,
      restSeconds: restSeconds || 60,
      notes: notes.trim() || undefined,
    })
    setNotes('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={plan.name}
      title={DAY_LABELS[day]}
      maxWidth="xl"
      footer={<Button onClick={onClose}>Готово</Button>}
    >
      <div className="space-y-8">
        <Section title="Вправи дня" aside={<span className="font-mono text-xs text-fg-subtle tabular">{dayExercises.length}</span>}>
          {dayExercises.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-fg-muted">
              День відпочинку. Додайте вправу нижче, щоб зробити його тренувальним.
            </p>
          ) : (
            <ol className="divide-y divide-line rounded-lg border border-line">
              {dayExercises.map((item, index) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-5 shrink-0 font-mono text-xs text-fg-subtle">{String(index + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-fg">{exerciseMap.get(item.exerciseId)?.name ?? 'Вправа'}</span>
                    <span className="block text-xs text-fg-subtle">
                      {item.sets} × {item.reps} · відпочинок {item.restSeconds} с{item.notes && ` · ${item.notes}`}
                    </span>
                  </span>
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-fg-subtle">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.5}
                      aria-label={`Вага для ${exerciseMap.get(item.exerciseId)?.name ?? 'вправи'}, кг`}
                      placeholder="—"
                      value={item.weight ?? ''}
                      onChange={(e) => onUpdateExercise(plan.id, day, item.id, { weight: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="h-9 w-16 rounded-md border border-line bg-surface-2 text-center font-mono text-sm text-fg focus:border-accent focus:outline-none"
                    />
                    кг
                  </label>
                  <IconButton size="sm" label="Прибрати з дня" icon={<Trash2 />} onClick={() => onRemoveExercise(plan.id, day, item.id)} className="hover:text-danger" />
                </li>
              ))}
            </ol>
          )}
        </Section>

        <Section title="Додати вправу">
          <form onSubmit={handleAdd} className="space-y-4">
            <Select label="Вправа" value={exerciseId} onChange={(e) => pickExercise(e.target.value)} options={options} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Input label="Підходи" type="number" inputMode="numeric" min={1} max={20} value={sets} onChange={(e) => setSets(Number(e.target.value))} placeholder="3" />
              <Input label="Повтори" type="number" inputMode="numeric" min={1} max={200} value={reps} onChange={(e) => setReps(Number(e.target.value))} placeholder="10" />
              <Input
                label="Вага, кг"
                type="number"
                inputMode="decimal"
                min={0}
                max={500}
                step={0.5}
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Без ваги"
              />
              <Input label="Відпочинок, с" type="number" inputMode="numeric" min={10} max={600} step={5} value={restSeconds} onChange={(e) => setRestSeconds(Number(e.target.value))} placeholder="60" />
            </div>
            <Input label="Нотатка" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Напр. пауза внизу 1 с" />
            <Button type="submit" variant="outline" icon={<Plus />} className="w-full sm:w-auto">
              Додати до дня
            </Button>
          </form>
        </Section>
      </div>
    </Modal>
  )
}
