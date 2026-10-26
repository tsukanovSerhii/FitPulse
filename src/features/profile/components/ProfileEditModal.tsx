import React, { useState } from 'react'
import type { UserProfile, FitnessGoal, ActivityLevel } from '../model/types'
import { FITNESS_GOAL_LABELS, ACTIVITY_LEVEL_LABELS } from '../model/types'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'

export interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  onSave: (updated: UserProfile) => Promise<void>
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name)
  const [age, setAge] = useState(profile.age)
  const [heightCm, setHeightCm] = useState(profile.heightCm)
  const [weightKg, setWeightKg] = useState(profile.weightKg)
  const [targetWeightKg, setTargetWeightKg] = useState(profile.targetWeightKg)
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(profile.gender)
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile.fitnessGoal)
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Введіть ім\'я')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      await onSave({
        ...profile,
        name: name.trim(),
        age: Number(age) || 20,
        heightCm: Number(heightCm) || 175,
        weightKg: Number(weightKg) || 70,
        targetWeightKg: Number(targetWeightKg) || 70,
        gender,
        fitnessGoal,
        activityLevel,
      })

      onClose()
    } catch {
      setError('Помилка оновлення профілю')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goalOptions = Object.entries(FITNESS_GOAL_LABELS).map(([k, v]) => ({
    value: k,
    label: v,
  }))

  const activityOptions = Object.entries(ACTIVITY_LEVEL_LABELS).map(([k, v]) => ({
    value: k,
    label: v,
  }))

  const genderOptions = [
    { value: 'male', label: 'Чоловіча' },
    { value: 'female', label: 'Жіноча' },
    { value: 'other', label: 'Інше' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редагування особистого профілю" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {error}
          </div>
        )}

        <Input
          label="Ваше ім'я"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Вік (років)"
            type="number"
            min={12}
            max={120}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
          <Select
            label="Стать"
            value={gender}
            onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
            options={genderOptions}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Зріст (см)"
            type="number"
            min={100}
            max={250}
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
          />
          <Input
            label="Поточна вага (кг)"
            type="number"
            min={30}
            max={300}
            step={0.5}
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
          />
          <Input
            label="Цільова вага (кг)"
            type="number"
            min={30}
            max={300}
            step={0.5}
            value={targetWeightKg}
            onChange={(e) => setTargetWeightKg(Number(e.target.value))}
          />
        </div>

        <Select
          label="Головна фітнес-ціль"
          value={fitnessGoal}
          onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
          options={goalOptions}
        />

        <Select
          label="Рівень фізичної активності"
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
          options={activityOptions}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Зберегти дані
          </Button>
        </div>
      </form>
    </Modal>
  )
}
