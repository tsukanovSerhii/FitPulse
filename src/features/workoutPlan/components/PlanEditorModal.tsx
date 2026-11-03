import { useId, useState, type FormEvent } from 'react'
import { Button, Input, Modal, Textarea } from '@/shared/ui'
import { ALL_DAYS, type DayOfWeek, type PlanExercise, type WorkoutPlan } from '../model/types'

export interface PlanEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: WorkoutPlan) => Promise<void>
  initialPlan?: WorkoutPlan | null
}

const emptySchedule = () => Object.fromEntries(ALL_DAYS.map((day) => [day, []])) as unknown as Record<DayOfWeek, PlanExercise[]>

export function PlanEditorModal({ isOpen, onClose, onSave, initialPlan }: PlanEditorModalProps) {
  const formId = useId()
  const [name, setName] = useState(initialPlan?.name ?? '')
  const [description, setDescription] = useState(initialPlan?.description ?? '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Введіть назву програми')
      return
    }
    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      await onSave({
        id: initialPlan?.id ?? `plan-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        createdAt: initialPlan?.createdAt ?? now,
        updatedAt: now,
        schedule: initialPlan?.schedule ?? emptySchedule(),
      })
      onClose()
    } catch {
      setError('Не вдалося зберегти програму')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialPlan ? 'Редагувати програму' : 'Нова програма'}
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            {initialPlan ? 'Зберегти' : 'Створити'}
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
          placeholder="Напр. Push / Pull / Legs"
          error={error}
          autoFocus
        />
        <Textarea
          label="Опис"
          helperText="Необов'язково: для кого програма і скільки днів на тиждень"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Напр. 3 дні на тиждень, середній рівень"
        />
      </form>
    </Modal>
  )
}
