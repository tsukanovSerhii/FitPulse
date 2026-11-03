import { useId, useState, type FormEvent } from 'react'
import { Button, Input, Modal, Select } from '@/shared/ui'
import type { ActivityLevel, FitnessGoal, UserProfile } from '../model/types'
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
  const [name, setName] = useState(profile.name)
  const [age, setAge] = useState(profile.age)
  const [heightCm, setHeightCm] = useState(profile.heightCm)
  const [weightKg, setWeightKg] = useState(profile.weightKg)
  const [targetWeightKg, setTargetWeightKg] = useState(profile.targetWeightKg)
  const [gender, setGender] = useState(profile.gender)
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile.fitnessGoal)
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError("Введіть ім'я")
      return
    }
    setIsSubmitting(true)
    try {
      await onSave({
        ...profile,
        name: name.trim(),
        age: age || profile.age,
        heightCm: heightCm || profile.heightCm,
        weightKg: weightKg || profile.weightKg,
        targetWeightKg: targetWeightKg || profile.targetWeightKg,
        gender,
        fitnessGoal,
        activityLevel,
      })
      onClose()
    } catch {
      setError('Не вдалося зберегти профіль')
    } finally {
      setIsSubmitting(false)
    }
  }

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
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <Input
            label="Ім'я"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="Як до вас звертатися"
            error={error}
          />
          <Input label="Вік" type="number" inputMode="numeric" min={12} max={120} value={age} onChange={(e) => setAge(Number(e.target.value))} placeholder="25" />
          <Select label="Стать" value={gender} onChange={(e) => setGender(e.target.value as UserProfile['gender'])} options={GENDER_OPTIONS} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Зріст, см" type="number" inputMode="numeric" min={100} max={250} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} placeholder="178" />
          <Input label="Вага, кг" type="number" inputMode="decimal" min={30} max={300} step={0.5} value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} placeholder="75" />
          <Input label="Ціль, кг" type="number" inputMode="decimal" min={30} max={300} step={0.5} value={targetWeightKg} onChange={(e) => setTargetWeightKg(Number(e.target.value))} placeholder="80" />
        </div>

        <Select label="Мета" value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)} options={toOptions(FITNESS_GOAL_LABELS)} />
        <Select label="Активність" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} options={toOptions(ACTIVITY_LEVEL_LABELS)} />
      </form>
    </Modal>
  )
}
