import { useId, useState, type FormEvent } from 'react'
import { Button, Input, Modal, Select, Textarea } from '@/shared/ui'
import type { Difficulty, Equipment, Exercise, MuscleGroup } from '../model/types'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '../model/types'

export interface AddExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (exercise: Omit<Exercise, 'id'>) => Promise<void>
}

const toOptions = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }))
const lines = (text: string) => text.split('\n').map((line) => line.trim()).filter(Boolean)

export function AddExerciseModal({ isOpen, onClose, onSubmit }: AddExerciseModalProps) {
  const formId = useId()
  const [name, setName] = useState('')
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup>('chest')
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const [equipment, setEquipment] = useState<Equipment>('dumbbell')
  const [description, setDescription] = useState('')
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [rest, setRest] = useState(60)
  const [stepsText, setStepsText] = useState('')
  const [cuesText, setCuesText] = useState('')
  const [mistakesText, setMistakesText] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Введіть назву вправи')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        primaryMuscle,
        muscleGroups: [primaryMuscle],
        difficulty,
        equipment,
        description: description.trim() || 'Власна вправа',
        defaultSets: sets || 3,
        defaultReps: reps || 10,
        defaultRestSeconds: rest || 60,
        technique: {
          steps: lines(stepsText).map((text, i) => ({ title: `Крок ${i + 1}`, text, frame: 0, seconds: 0 })),
          cues: lines(cuesText),
          mistakes: lines(mistakesText),
        },
      })
      onClose()
    } catch {
      setError('Не вдалося зберегти вправу')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Нова вправа"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            Створити
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Назва"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          placeholder="Напр. Жим Арнольда"
          error={error}
          autoFocus
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="М'язи" value={primaryMuscle} onChange={(e) => setPrimaryMuscle(e.target.value as MuscleGroup)} options={toOptions(MUSCLE_GROUP_LABELS)} />
          <Select label="Рівень" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} options={toOptions(DIFFICULTY_LABELS)} />
          <Select label="Обладнання" value={equipment} onChange={(e) => setEquipment(e.target.value as Equipment)} options={toOptions(EQUIPMENT_LABELS)} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Підходи" type="number" inputMode="numeric" min={1} max={20} value={sets} onChange={(e) => setSets(Number(e.target.value))} placeholder="3" />
          <Input label="Повтори" type="number" inputMode="numeric" min={1} max={200} value={reps} onChange={(e) => setReps(Number(e.target.value))} placeholder="10" />
          <Input label="Відпочинок, с" type="number" inputMode="numeric" min={10} max={600} step={5} value={rest} onChange={(e) => setRest(Number(e.target.value))} placeholder="60" />
        </div>

        <Textarea label="Опис" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Коротко: що розвиває вправа" rows={2} />
        <Textarea
          label="Кроки техніки"
          helperText="Кожен крок з нового рядка"
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          placeholder={'Займіть вихідне положення\nОпустіть вагу на вдиху\nПідніміть на видиху'}
          rows={4}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea label="Ключові моменти" helperText="Необов'язково, по рядку" value={cuesText} onChange={(e) => setCuesText(e.target.value)} placeholder="Спина рівна" />
          <Textarea label="Типові помилки" helperText="Необов'язково, по рядку" value={mistakesText} onChange={(e) => setMistakesText(e.target.value)} placeholder="Ривки корпусом" />
        </div>
      </form>
    </Modal>
  )
}
