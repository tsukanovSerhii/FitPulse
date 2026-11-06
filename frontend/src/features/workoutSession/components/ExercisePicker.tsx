import { useMemo, useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { useAppSelector } from '@/app/store/hooks'
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS, type Exercise } from '@/features/exercises/model'
import { Button, Modal, SearchInput, SegmentedControl } from '@/shared/ui'
import { useIncrementalList } from '@/shared/lib/useIncrementalList'
import { pickerResults, recentExerciseIds, type PickerGroup } from '../lib/freeWorkout'

const GROUP_OPTIONS: { value: PickerGroup; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'chest', label: 'Груди' },
  { value: 'back', label: 'Спина' },
  { value: 'legs', label: 'Ноги' },
  { value: 'shoulders', label: 'Плечі' },
  { value: 'arms', label: 'Руки' },
  { value: 'abs', label: 'Прес' },
  { value: 'cardio', label: 'Кардіо' },
]

export interface ExercisePickerProps {
  isOpen: boolean
  onClose: () => void
  /** Exercise ids already in the workout */
  addedIds: Set<string>
  onPick: (exercise: Exercise) => void
}

const LIST_STEP = 30

export function ExercisePicker({ isOpen, onClose, addedIds, onPick }: ExercisePickerProps) {
  const exercises = useAppSelector((state) => state.exercises.items)
  const history = useAppSelector((state) => state.progress.history)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<PickerGroup>('all')

  const recent = useMemo(() => recentExerciseIds(history), [history])
  const results = useMemo(() => pickerResults(exercises, query, group, recent), [exercises, query, group, recent])
  const recentSet = new Set(recent)
  const { visible, hasMore, showMore, watchEnd, remaining } = useIncrementalList(results, { step: LIST_STEP, resetKey: results })

  const pick = (exercise: Exercise) => {
    onPick(exercise)
    onClose()
    setQuery('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Додати вправу" maxWidth="lg">
      <div className="space-y-3">
        <SearchInput label="Пошук вправи" placeholder="Назва вправи" value={query} onChange={setQuery} />
        <div className="-mx-1 overflow-x-auto px-1">
          <SegmentedControl label="Група м'язів" size="sm" options={GROUP_OPTIONS} value={group} onChange={setGroup} />
        </div>

        {results.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-fg-muted">Нічого не знайдено. Спробуйте іншу назву або групу.</p>
        ) : (
          <div className="space-y-3">
            <ul className="divide-y divide-line rounded-lg border border-line">
              {visible.map((exercise) => {
                const added = addedIds.has(exercise.id)
                return (
                  <li key={exercise.id}>
                    <button
                      type="button"
                      onClick={() => pick(exercise)}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-fg">{exercise.name}</span>
                        <span className="block text-xs text-fg-subtle">
                          {MUSCLE_GROUP_LABELS[exercise.primaryMuscle]} · {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
                          {recentSet.has(exercise.id) && ' · нещодавно'}
                        </span>
                      </span>
                      {added ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-fg-muted">
                          <Check className="size-3.5" aria-hidden="true" />У тренуванні
                        </span>
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
            {hasMore && (
              <div ref={watchEnd} className="flex justify-center pt-2">
                <Button variant="outline" size="sm" onClick={showMore}>
                  Показати ще {Math.min(remaining, LIST_STEP)}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
