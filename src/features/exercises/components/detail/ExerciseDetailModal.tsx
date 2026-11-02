import { Check, Heart, X } from 'lucide-react'
import { MuscleMap } from '@/components/common/muscle-map/MuscleMap'
import { Disclosure, IconButton, Modal } from '@/components/ui'
import { getTechnique } from '../../lib/technique'
import type { Exercise } from '../../model/types'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '../../model/types'
import { TechniquePlayer } from '../technique/TechniquePlayer'

export interface ExerciseDetailModalProps {
  exercise: Exercise | null
  isOpen: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

function PointList({ title, items, tone }: { title: string; items: string[]; tone: 'do' | 'avoid' }) {
  const Icon = tone === 'do' ? Check : X
  return (
    <section className="space-y-3">
      <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-fg">
            <Icon className={tone === 'do' ? 'mt-0.5 size-4 shrink-0 text-success' : 'mt-0.5 size-4 shrink-0 text-danger'} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ExerciseDetailModal({ exercise, isOpen, onClose, isFavorite, onToggleFavorite }: ExerciseDetailModalProps) {
  if (!exercise) return null
  const technique = getTechnique(exercise)
  const meta = [
    DIFFICULTY_LABELS[exercise.difficulty],
    EQUIPMENT_LABELS[exercise.equipment],
    `${exercise.defaultSets} × ${exercise.defaultReps}`,
    `відпочинок ${exercise.defaultRestSeconds} с`,
  ].join(' · ')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={MUSCLE_GROUP_LABELS[exercise.primaryMuscle]}
      title={exercise.name}
      subtitle={meta}
      maxWidth="2xl"
      headerActions={
        <IconButton
          size="sm"
          label={isFavorite ? 'Прибрати з обраного' : 'Додати в обране'}
          aria-pressed={isFavorite}
          icon={<Heart className={isFavorite ? 'fill-current' : undefined} />}
          onClick={() => onToggleFavorite(exercise.id)}
          className={isFavorite ? 'text-danger hover:text-danger' : undefined}
        />
      }
    >
      <div className="space-y-8">
        <TechniquePlayer exercise={exercise} />

        {(technique.cues.length > 0 || technique.mistakes.length > 0) && (
          <div className="grid gap-6 sm:grid-cols-2">
            {technique.cues.length > 0 && <PointList title="Ключові моменти" items={technique.cues} tone="do" />}
            {technique.mistakes.length > 0 && <PointList title="Типові помилки" items={technique.mistakes} tone="avoid" />}
          </div>
        )}

        <div className="border-b border-line">
          <Disclosure title="Задіяні м’язи" defaultOpen={!exercise.frames}>
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-fg-muted">{exercise.description}</p>
              <MuscleMap primaryMuscle={exercise.primaryMuscle} muscleGroups={exercise.muscleGroups} />
              {exercise.calories && <p className="text-sm text-fg-muted">Енерговитрати: ~{exercise.calories} ккал/хв</p>}
            </div>
          </Disclosure>
          {technique.advanced && technique.advanced.length > 0 && (
            <Disclosure title="Для досвідчених">
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-fg-muted marker:text-fg-subtle">
                {technique.advanced.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </Disclosure>
          )}
        </div>
      </div>
    </Modal>
  )
}
