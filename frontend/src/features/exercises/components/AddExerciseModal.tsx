import { useId, useState } from 'react'
import { useZodForm } from '@/shared/lib/form'
import { Button, Input, Modal, Select, Textarea } from '@/shared/ui'
import { customExerciseSchema, type CustomExerciseForm } from '../lib/schema'
import type { Exercise } from '../model/types'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '../model/types'

export interface AddExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (exercise: Omit<Exercise, 'id'>) => Promise<void>
}

const toOptions = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }))
const lines = (text: string) => text.split('\n').map((line) => line.trim()).filter(Boolean)

function toExercise(data: CustomExerciseForm): Omit<Exercise, 'id'> {
  return {
    name: data.name,
    primaryMuscle: data.primaryMuscle,
    muscleGroups: [data.primaryMuscle],
    difficulty: data.difficulty,
    equipment: data.equipment,
    description: data.description || 'Власна вправа',
    defaultSets: data.sets,
    defaultReps: data.reps,
    defaultRestSeconds: data.rest,
    technique: {
      steps: lines(data.steps).map((text, i) => ({ title: `Крок ${i + 1}`, text, frame: 0, seconds: 0 })),
      cues: lines(data.cues),
      mistakes: lines(data.mistakes),
    },
  }
}

export function AddExerciseModal({ isOpen, onClose, onSubmit }: AddExerciseModalProps) {
  const formId = useId()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { values, errors, set, setErrors, handleSubmit } = useZodForm(customExerciseSchema, {
    name: '',
    primaryMuscle: 'chest',
    difficulty: 'beginner',
    equipment: 'dumbbell',
    sets: 3,
    reps: 10,
    rest: 60,
    description: '',
    steps: '',
    cues: '',
    mistakes: '',
  })

  const save = async (data: CustomExerciseForm) => {
    setIsSubmitting(true)
    try {
      await onSubmit(toExercise(data))
      onClose()
    } catch {
      setErrors({ name: 'Не вдалося зберегти вправу' })
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
      <form id={formId} onSubmit={handleSubmit(save)} noValidate className="space-y-5">
        <Input label="Назва" value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="Напр. Жим Арнольда" error={errors.name} autoFocus />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="М'язи"
            value={values.primaryMuscle}
            onChange={(e) => set('primaryMuscle', e.target.value as CustomExerciseForm['primaryMuscle'])}
            options={toOptions(MUSCLE_GROUP_LABELS)}
          />
          <Select
            label="Рівень"
            value={values.difficulty}
            onChange={(e) => set('difficulty', e.target.value as CustomExerciseForm['difficulty'])}
            options={toOptions(DIFFICULTY_LABELS)}
          />
          <Select
            label="Обладнання"
            value={values.equipment}
            onChange={(e) => set('equipment', e.target.value as CustomExerciseForm['equipment'])}
            options={toOptions(EQUIPMENT_LABELS)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Підходи" type="number" inputMode="numeric" value={values.sets} onChange={(e) => set('sets', Number(e.target.value))} placeholder="3" error={errors.sets} />
          <Input label="Повтори" type="number" inputMode="numeric" value={values.reps} onChange={(e) => set('reps', Number(e.target.value))} placeholder="10" error={errors.reps} />
          <Input
            label="Відпочинок, с"
            type="number"
            inputMode="numeric"
            step={5}
            value={values.rest}
            onChange={(e) => set('rest', Number(e.target.value))}
            placeholder="60"
            error={errors.rest}
          />
        </div>

        <Textarea label="Опис" value={values.description} onChange={(e) => set('description', e.target.value)} placeholder="Коротко: що розвиває вправа" rows={2} error={errors.description} />
        <Textarea
          label="Кроки техніки"
          helperText="Кожен крок з нового рядка"
          value={values.steps}
          onChange={(e) => set('steps', e.target.value)}
          placeholder={'Займіть вихідне положення\nОпустіть вагу на вдиху\nПідніміть на видиху'}
          rows={4}
          error={errors.steps}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea label="Ключові моменти" helperText="Необов'язково, по рядку" value={values.cues} onChange={(e) => set('cues', e.target.value)} placeholder="Спина рівна" error={errors.cues} />
          <Textarea
            label="Типові помилки"
            helperText="Необов'язково, по рядку"
            value={values.mistakes}
            onChange={(e) => set('mistakes', e.target.value)}
            placeholder="Ривки корпусом"
            error={errors.mistakes}
          />
        </div>
      </form>
    </Modal>
  )
}
