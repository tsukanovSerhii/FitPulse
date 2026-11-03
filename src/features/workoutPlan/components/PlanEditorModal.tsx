import { useId, useState } from 'react'
import { useZodForm } from '@/shared/lib/form'
import { Button, Input, Modal, Textarea } from '@/shared/ui'
import { planFormSchema } from '../lib/schemas'
import { ALL_DAYS, type DayOfWeek, type PlanExercise, type WorkoutPlan } from '../model/types'

export interface PlanEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: WorkoutPlan) => Promise<void>
  initialPlan?: WorkoutPlan | null
}

const emptySchedule = () => Object.fromEntries(ALL_DAYS.map((day) => [day, []])) as unknown as Record<DayOfWeek, PlanExercise[]>

function toPlan({ name, description }: { name: string; description: string }, existing?: WorkoutPlan | null): WorkoutPlan {
  const now = new Date().toISOString()
  return {
    id: existing?.id ?? `plan-${Date.now()}`,
    name,
    description,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    schedule: existing?.schedule ?? emptySchedule(),
  }
}

export function PlanEditorModal({ isOpen, onClose, onSave, initialPlan }: PlanEditorModalProps) {
  const formId = useId()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { values, errors, set, setErrors, handleSubmit } = useZodForm(planFormSchema, {
    name: initialPlan?.name ?? '',
    description: initialPlan?.description ?? '',
  })

  const save = async (data: { name: string; description: string }) => {
    setIsSubmitting(true)
    try {
      await onSave(toPlan(data, initialPlan))
      onClose()
    } catch {
      setErrors({ name: 'Не вдалося зберегти програму' })
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
      <form id={formId} onSubmit={handleSubmit(save)} noValidate className="space-y-5">
        <Input
          label="Назва"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Напр. Push / Pull / Legs"
          error={errors.name}
          autoFocus
        />
        <Textarea
          label="Опис"
          helperText="Необов'язково: для кого програма і скільки днів на тиждень"
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Напр. 3 дні на тиждень, середній рівень"
          error={errors.description}
        />
      </form>
    </Modal>
  )
}
