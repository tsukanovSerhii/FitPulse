import { useState } from 'react'
import { Activity, Heart, Layers, Sparkles } from 'lucide-react'
import { Badge, Button, Modal, SegmentedControl, Stat, type SegmentOption } from '@/components/ui'
import type { Exercise } from '../../model/types'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '../../model/types'
import { AnatomyTab, GuideTab, TechniqueTab } from './tabs'

type Tab = 'technique' | 'anatomy' | 'guide'

const TABS: SegmentOption<Tab>[] = [
  { value: 'technique', label: <><Sparkles />Техніка</> },
  { value: 'anatomy', label: <><Activity />Анатомія</> },
  { value: 'guide', label: <><Layers />Поради</> },
]

const DIFFICULTY_VARIANT = { beginner: 'success', intermediate: 'warning', advanced: 'danger' } as const

export interface ExerciseDetailModalProps {
  exercise: Exercise | null
  isOpen: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

export function ExerciseDetailModal({ exercise, isOpen, onClose, isFavorite, onToggleFavorite }: ExerciseDetailModalProps) {
  const [tab, setTab] = useState<Tab>('technique')
  if (!exercise) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} eyebrow={MUSCLE_GROUP_LABELS[exercise.primaryMuscle]} title={exercise.name} maxWidth="2xl">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={DIFFICULTY_VARIANT[exercise.difficulty]} size="sm">
              {DIFFICULTY_LABELS[exercise.difficulty]}
            </Badge>
            <Badge size="sm">{EQUIPMENT_LABELS[exercise.equipment]}</Badge>
          </div>
          <Button
            variant={isFavorite ? 'danger' : 'outline'}
            size="sm"
            onClick={() => onToggleFavorite(exercise.id)}
            icon={<Heart className={isFavorite ? 'fill-current' : undefined} />}
          >
            {isFavorite ? 'В обраному' : 'В обране'}
          </Button>
        </div>

        <p className="text-sm leading-relaxed text-fg-muted">{exercise.description}</p>

        <div className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line">
          <Stat className="p-3 sm:p-4" label="Підходи" value={exercise.defaultSets} />
          <Stat className="p-3 sm:p-4" label="Повтори" value={exercise.defaultReps} />
          <Stat className="p-3 sm:p-4" label="Відпочинок" value={exercise.defaultRestSeconds} unit="с" />
        </div>

        <SegmentedControl label="Розділ" appearance="underline" options={TABS} value={tab} onChange={setTab} className="w-full" />

        {tab === 'technique' && <TechniqueTab exercise={exercise} />}
        {tab === 'anatomy' && <AnatomyTab exercise={exercise} />}
        {tab === 'guide' && <GuideTab exercise={exercise} />}
      </div>
    </Modal>
  )
}
