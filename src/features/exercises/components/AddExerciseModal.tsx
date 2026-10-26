import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Exercise, MuscleGroup, Difficulty, Equipment } from '../model/types'
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS } from '../model/types'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'

export interface AddExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (exercise: Omit<Exercise, 'id'>) => Promise<void>
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('')
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup>('chest')
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const [equipment, setEquipment] = useState<Equipment>('dumbbell')
  const [description, setDescription] = useState('')
  const [defaultSets, setDefaultSets] = useState(3)
  const [defaultReps, setDefaultReps] = useState(10)
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(60)
  const [instructionsText, setInstructionsText] = useState('')
  const [tipsText, setTipsText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Введіть назву вправи')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const instructions = instructionsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((desc, idx) => ({ step: idx + 1, description: desc }))

      const tips = tipsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      await onSubmit({
        name: name.trim(),
        primaryMuscle,
        muscleGroups: [primaryMuscle],
        difficulty,
        equipment,
        description: description.trim() || 'Користувацька вправа',
        instructions: instructions.length > 0 ? instructions : [{ step: 1, description: 'Виконайте підхід відповідно до індивідуального плану' }],
        tips: tips.length > 0 ? tips : ['Слідкуйте за технікою виконання'],
        defaultSets: Number(defaultSets) || 3,
        defaultReps: Number(defaultReps) || 10,
        defaultRestSeconds: Number(defaultRestSeconds) || 60,
        calories: 6,
      })

      // Reset form
      setName('')
      setDescription('')
      setInstructionsText('')
      setTipsText('')
      onClose()
    } catch {
      setError('Не вдалося зберегти вправу')
    } finally {
      setIsSubmitting(false)
    }
  }

  const muscleOptions = Object.entries(MUSCLE_GROUP_LABELS).map(([val, lbl]) => ({
    value: val,
    label: lbl,
  }))

  const difficultyOptions = Object.entries(DIFFICULTY_LABELS).map(([val, lbl]) => ({
    value: val,
    label: lbl,
  }))

  const equipmentOptions = Object.entries(EQUIPMENT_LABELS).map(([val, lbl]) => ({
    value: val,
    label: lbl,
  }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Додати нову вправу" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {error}
          </div>
        )}

        <Input
          label="Назва вправи *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Наприклад: Жим Арнольда з гантелями"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Група м'язів"
            value={primaryMuscle}
            onChange={(e) => setPrimaryMuscle(e.target.value as MuscleGroup)}
            options={muscleOptions}
          />
          <Select
            label="Складність"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            options={difficultyOptions}
          />
          <Select
            label="Обладнання"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value as Equipment)}
            options={equipmentOptions}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Короткий опис
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишіть призначення вправи..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Підходи (сети)"
            type="number"
            min={1}
            max={20}
            value={defaultSets}
            onChange={(e) => setDefaultSets(Number(e.target.value))}
          />
          <Input
            label="Повторення"
            type="number"
            min={1}
            max={200}
            value={defaultReps}
            onChange={(e) => setDefaultReps(Number(e.target.value))}
          />
          <Input
            label="Відпочинок (сек)"
            type="number"
            min={10}
            max={600}
            step={5}
            value={defaultRestSeconds}
            onChange={(e) => setDefaultRestSeconds(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Покрокова техніка (кожен крок з нового рядка)
          </label>
          <textarea
            rows={3}
            value={instructionsText}
            onChange={(e) => setInstructionsText(e.target.value)}
            placeholder="Крок 1: Займіть початкове положення...&#10;Крок 2: На вдиху опустіться...&#10;Крок 3: На видиху підніміться..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Скасувати
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon={<Plus className="w-4 h-4" />}
          >
            Створити вправу
          </Button>
        </div>
      </form>
    </Modal>
  )
}
