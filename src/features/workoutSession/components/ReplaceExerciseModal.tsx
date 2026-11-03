import { useAppSelector } from '@/app/store/hooks'
import { AlternativeList, alternativesFor, variantsOf, type Exercise } from '@/features/exercises'
import { Modal } from '@/shared/ui'

export interface ReplaceExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  exercise: Exercise
  onReplace: (exercise: Exercise) => void
}

/** Same movement with other equipment first, then other exercises for the same muscle. */
export function ReplaceExerciseModal({ isOpen, onClose, exercise, onReplace }: ReplaceExerciseModalProps) {
  const all = useAppSelector((state) => state.exercises.items)
  const available = useAppSelector((state) => state.exercises.filters.equipment)
  const variants = variantsOf(exercise, all).filter((v) => v.id !== exercise.id)
  const alternatives = alternativesFor(exercise, all, { limit: 5, available })

  const pick = (next: Exercise) => {
    onReplace(next)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} eyebrow={exercise.name} title="Замінити вправу" subtitle="Ціль за підходами й повторами залишиться тією самою." maxWidth="lg">
      <div className="space-y-6">
        {variants.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">Інше обладнання</h3>
            <AlternativeList items={variants} onSelect={pick} />
          </section>
        )}
        {alternatives.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">Схожі вправи</h3>
            <AlternativeList items={alternatives} onSelect={pick} />
          </section>
        )}
        {variants.length === 0 && alternatives.length === 0 && (
          <p className="py-6 text-center text-sm text-fg-muted">Для цієї вправи немає заміни з вашим обладнанням.</p>
        )}
      </div>
    </Modal>
  )
}
