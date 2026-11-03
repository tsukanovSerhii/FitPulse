import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, Check, ChevronLeft, ChevronRight, Dumbbell, Info, Plus, Trash2 } from 'lucide-react'
import { Button, EmptyState, IconButton, Modal } from '@/shared/ui'
import { TechniquePlayer, MUSCLE_GROUP_LABELS } from '@/features/exercises'
import type { WorkoutHistoryLog } from '@/features/progress'
import { formatSessionTitle } from '../lib/summary'
import { useWakeLock } from '../hooks/useWakeLock'
import { ActiveSetPanel } from './focus/ActiveSetPanel'
import { FocusHeader } from './focus/FocusHeader'
import { SetList } from './focus/SetList'
import { useWorkoutFocus } from '../hooks/useWorkoutFocus'
import { RestTimerSheet } from './RestTimerSheet'
import { ExercisePicker } from './ExercisePicker'
import { ReplaceExerciseModal } from './ReplaceExerciseModal'
import { formatNumber } from '@/shared/lib/formatters'

const shortDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' })

export function WorkoutFocusView({ onFinish }: { onFinish: (log: WorkoutHistoryLog) => void }) {
  const navigate = useNavigate()
  const focus = useWorkoutFocus(onFinish)
  const { session, isFree, index, planExercise, target, exercise, doneSets, lastSet } = focus
  const [techniqueOpen, setTechniqueOpen] = useState(false)
  // A fresh free workout opens straight into choosing the first exercise
  const [pickerOpen, setPickerOpen] = useState(() => isFree && session.exercises.length === 0)
  const openPicker = () => setPickerOpen(true)
  const [replaceOpen, setReplaceOpen] = useState(false)

  useWakeLock(session.isActive)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <FocusHeader
        title={formatSessionTitle(session.dayLabel)}
        elapsedSeconds={session.elapsedSeconds}
        progress={focus.progress}
        currentIndex={index}
        onSelect={focus.goTo}
        onMinimize={() => navigate('/')}
        onFinish={focus.finish}
      />

      <main className="flex-1 overflow-y-auto">
        {planExercise && target && exercise ? (
          <div className="mx-auto max-w-lg space-y-6 px-5 py-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em]">
                <span className="text-accent">
                  Вправа {index + 1} / {session.exercises.length}
                </span>
                <span className="text-fg-subtle">{MUSCLE_GROUP_LABELS[exercise.primaryMuscle]}</span>
              </div>
              <div className="flex items-start gap-3">
                <h1 className="flex-1 text-4xl leading-[1.08] text-fg">{exercise.name}</h1>
                {doneSets.length === 0 && (
                  <IconButton label="Замінити вправу" icon={<ArrowLeftRight />} onClick={() => setReplaceOpen(true)} className="border border-line" />
                )}
                <IconButton label="Техніка виконання" icon={<Info />} onClick={() => setTechniqueOpen(true)} className="border border-line" />
              </div>
              <p className="font-mono text-sm text-fg-muted tabular">
                {isFree
                  ? `Підходів: ${doneSets.length} · відпочинок ${planExercise.restSeconds} с`
                  : `Ціль: ${planExercise.sets} × ${planExercise.reps}${planExercise.weight ? ` · ${planExercise.weight} кг` : ''} · відпочинок ${planExercise.restSeconds} с`}
              </p>
              {focus.previous && (
                <p className="text-sm text-fg-muted">
                  Минулого разу{' '}
                  <span className="text-fg-subtle">({shortDate.format(new Date(focus.previous.date))})</span>:{' '}
                  <span className="font-mono text-fg tabular">
                    {focus.previous.weightKg ? `${formatNumber(focus.previous.weightKg, 1)} кг × ${focus.previous.reps ?? '?'}` : `${focus.previous.sets} підх.`}
                  </span>
                </p>
              )}
              {planExercise.notes && <p className="border-l-2 border-accent pl-3 text-sm text-fg-muted">{planExercise.notes}</p>}
            </div>

            <SetList target={target} done={doneSets} onUndo={focus.undoLastSet} />

            {isFree && (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" className="flex-1" onClick={openPicker} icon={<Plus />}>
                  Додати вправу
                </Button>
                {doneSets.length === 0 && (
                  <Button variant="ghost" onClick={focus.removeCurrentExercise} icon={<Trash2 />} className="text-fg-muted hover:text-danger">
                    Прибрати
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => focus.goTo(index - 1)} icon={<ChevronLeft />}>
                Попередня
              </Button>
              <Button variant="ghost" size="sm" disabled={focus.isLastExercise} onClick={() => focus.goTo(index + 1)}>
                Наступна <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <button type="button" onClick={focus.cancel} className="mx-auto block cursor-pointer text-xs font-semibold text-fg-subtle hover:text-danger">
              Скасувати тренування
            </button>
          </div>
        ) : isFree ? (
          <div className="mx-auto max-w-lg space-y-6 px-5 py-10">
            <EmptyState
              icon={<Dumbbell />}
              title="Вільне тренування"
              description="Додавайте вправи по ходу і записуйте кожен підхід. Таймер відпочинку стартує сам."
              action={
                <Button onClick={openPicker} icon={<Plus />}>
                  Додати вправу
                </Button>
              }
            />
            <button type="button" onClick={focus.cancel} className="mx-auto block cursor-pointer text-xs font-semibold text-fg-subtle hover:text-danger">
              Скасувати тренування
            </button>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-fg-subtle">У цьому тренуванні немає вправ.</p>
        )}
      </main>

      {planExercise && (
        <footer className="border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-lg px-5 py-4">
            {!focus.exerciseComplete ? (
              <ActiveSetPanel
                key={`${planExercise.id}-${doneSets.length}`}
                setNumber={doneSets.length + 1}
                initialWeight={lastSet?.weight ?? planExercise.weight}
                initialReps={lastSet?.reps ?? planExercise.reps}
                showWeight={focus.showWeight}
                barbell={exercise?.equipment === 'barbell'}
                onDone={focus.completeCurrentSet}
              />
            ) : focus.isLastExercise ? (
              <Button size="lg" className="h-14 w-full text-base" onClick={focus.finish} icon={<Check className="size-5!" />}>
                Завершити тренування
              </Button>
            ) : (
              <Button size="lg" className="h-14 w-full text-base" onClick={() => focus.goTo(index + 1)}>
                Наступна вправа <ChevronRight className="size-5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </footer>
      )}

      <RestTimerSheet nextHint={focus.nextHint} />

      {isFree && (
        <ExercisePicker
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          addedIds={new Set(session.exercises.map((e) => e.exerciseId))}
          onPick={focus.addExercise}
        />
      )}

      {exercise && (
        <ReplaceExerciseModal isOpen={replaceOpen} onClose={() => setReplaceOpen(false)} exercise={exercise} onReplace={focus.replaceCurrentExercise} />
      )}

      <Modal isOpen={techniqueOpen} onClose={() => setTechniqueOpen(false)} title={exercise?.name} maxWidth="2xl">
        {exercise && <TechniquePlayer exercise={exercise} />}
      </Modal>
    </div>
  )
}
