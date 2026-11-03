import { useId, useState, type ChangeEvent } from 'react'
import { useZodForm } from '@/shared/lib/form'
import { Button, Input, Modal, Select } from '@/shared/ui'
import { profileFormSchema, type ProfileForm } from '../lib/schema'
import type { UserProfile } from '../model/types'
import { ACTIVITY_LEVEL_LABELS, FITNESS_GOAL_LABELS } from '../model/types'

export interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  onSave: (updated: UserProfile) => Promise<void>
}

const toOptions = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }))

const GENDER_OPTIONS = [
  { value: 'male', label: 'Чоловіча' },
  { value: 'female', label: 'Жіноча' },
  { value: 'other', label: 'Інша' },
]

export function ProfileEditModal({ isOpen, onClose, profile, onSave }: ProfileEditModalProps) {
  const formId = useId()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { values, errors, set, setErrors, handleSubmit } = useZodForm(profileFormSchema, {
    name: profile.name,
    age: profile.age,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    targetWeightKg: profile.targetWeightKg,
    gender: profile.gender,
    fitnessGoal: profile.fitnessGoal,
    activityLevel: profile.activityLevel,
  })

  const save = async (data: ProfileForm) => {
    setIsSubmitting(true)
    try {
      await onSave({ ...profile, ...data })
      onClose()
    } catch {
      setErrors({ name: 'Не вдалося зберегти профіль' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const number = (field: 'age' | 'heightCm' | 'weightKg' | 'targetWeightKg') => ({
    type: 'number',
    value: Number.isNaN(values[field]) ? '' : values[field],
    onChange: (e: ChangeEvent<HTMLInputElement>) => set(field, e.target.value === '' ? Number.NaN : Number(e.target.value)),
    error: errors[field],
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редагувати профіль"
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            Зберегти
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(save)} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <Input label="Ім'я" value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="Як до вас звертатися" error={errors.name} />
          <Input label="Вік" inputMode="numeric" placeholder="25" {...number('age')} />
          <Select label="Стать" value={values.gender} onChange={(e) => set('gender', e.target.value as ProfileForm['gender'])} options={GENDER_OPTIONS} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Зріст, см" inputMode="numeric" placeholder="178" {...number('heightCm')} />
          <Input label="Вага, кг" inputMode="decimal" step={0.5} placeholder="75" {...number('weightKg')} />
          <Input label="Ціль, кг" inputMode="decimal" step={0.5} placeholder="80" {...number('targetWeightKg')} />
        </div>

        <Select label="Мета" value={values.fitnessGoal} onChange={(e) => set('fitnessGoal', e.target.value as ProfileForm['fitnessGoal'])} options={toOptions(FITNESS_GOAL_LABELS)} />
        <Select
          label="Активність"
          value={values.activityLevel}
          onChange={(e) => set('activityLevel', e.target.value as ProfileForm['activityLevel'])}
          options={toOptions(ACTIVITY_LEVEL_LABELS)}
        />
      </form>
    </Modal>
  )
}
