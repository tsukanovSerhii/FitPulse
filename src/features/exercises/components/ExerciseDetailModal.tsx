import { Check, ChevronRight, Heart, X } from 'lucide-react'
import { MuscleMap } from './MuscleMap'
import { Disclosure, IconButton, Modal, SegmentedControl } from '@/shared/ui'
import { getTechnique } from '../lib/technique'
import { alternativesFor, variantsOf } from '../lib/variants'
import type { Equipment, Exercise } from '../model/types'
import { DIFFICULTY_LABELS, EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '../model/types'
import { TechniquePlayer } from './technique/TechniquePlayer'

export interface ExerciseDetailModalProps {
  exercise: Exercise | null
  isOpen: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  /** The whole catalog: source of variants and alternatives */
  allExercises?: Exercise[]
  /** Equipment the user has; alternatives keep to it */
  availableEquipment?: Equipment[]
  /** Opens another exercise in the same dialog: a variant or an alternative */
  onSelectExercise?: (exercise: Exercise) => void
}

export function AlternativeList({ items, onSelect }: { items: Exercise[]; onSelect: (exercise: Exercise) => void }) {
  return (
    <ul className="divide-y divide-line rounded-lg border border-line">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-fg">{item.name}</span>
              <span className="block text-xs text-fg-subtle">
                {EQUIPMENT_LABELS[item.equipment]} · {DIFFICULTY_LABELS[item.difficulty]}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )
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

export function ExerciseDetailModal({
  exercise,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  allExercises = [],
  availableEquipment,
  onSelectExercise,
}: ExerciseDetailModalProps) {
  if (!exercise) return null
  const technique = getTechnique(exercise)
  const variants = variantsOf(exercise, allExercises)
  const alternatives = onSelectExercise ? alternativesFor(exercise, allExercises, { available: availableEquipment }) : []
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
        {variants.length > 1 && onSelectExercise && (
          <div className="-mx-1 -mt-2 overflow-x-auto px-1">
            <SegmentedControl
              label={`Варіант: ${exercise.variant!.groupName}`}
              size="sm"
              options={variants.map((v) => ({ value: v.id, label: v.variant!.label }))}
              value={exercise.id}
              onChange={(id) => onSelectExercise(variants.find((v) => v.id === id)!)}
            />
          </div>
        )}

        <TechniquePlayer key={exercise.id} exercise={exercise} />

        {(technique.cues.length > 0 || technique.mistakes.length > 0) && (
          <div className="grid gap-6 sm:grid-cols-2">
            {technique.cues.length > 0 && <PointList title="Ключові моменти" items={technique.cues} tone="do" />}
            {technique.mistakes.length > 0 && <PointList title="Типові помилки" items={technique.mistakes} tone="avoid" />}
          </div>
        )}

        {alternatives.length > 0 && onSelectExercise && (
          <section className="space-y-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">Замінити на…</h3>
            <AlternativeList items={alternatives} onSelect={onSelectExercise} />
          </section>
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
