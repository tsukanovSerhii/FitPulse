import React, { useState } from 'react'
import type { WorkoutPlan, DayOfWeek, PlanExercise } from '../model/types'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

export interface PlanEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: WorkoutPlan) => Promise<void>
  initialPlan?: WorkoutPlan | null
}

const emptySchedule: Record<DayOfWeek, PlanExercise[]> = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
}

export const PlanEditorModal: React.FC<PlanEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlan,
}) => {
  const [name, setName] = useState(initialPlan?.name || '')
  const [description, setDescription] = useState(initialPlan?.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Введіть назву тренувального плану')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const plan: WorkoutPlan = {
        id: initialPlan?.id || `plan-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        createdAt: initialPlan?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schedule: initialPlan?.schedule || { ...emptySchedule },
      }

      await onSave(plan)
      setName('')
      setDescription('')
      onClose()
    } catch {
      setError('Помилка збереження програми')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialPlan ? 'Редагувати програму' : 'Створити нову програму'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {error}
          </div>
        )}

        <Input
          label="Назва програми *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Наприклад: Жим / Тяга / Ноги (Профі)"
          required
        />

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Опис та цілі програми
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишіть для кого підходить план, періодичність відпочинку тощо..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialPlan ? 'Зберегти зміни' : 'Створити програму'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
