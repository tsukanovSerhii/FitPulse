import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { ExerciseMotionPlayer } from '@/components/common/motion-player/ExerciseMotionPlayer'
import { Button, IconButton, Modal } from '@/components/ui'
import { MUSCLE_GROUP_LABELS } from '@/features/exercises/model/types'
import type { WorkoutHistoryLog } from '@/features/progress/model/types'
import { formatSessionTitle } from '../lib/summary'
import { useWakeLock } from '../lib/useWakeLock'
import { ActiveSetPanel } from './focus/ActiveSetPanel'
import { FocusHeader } from './focus/FocusHeader'
import { SetList } from './focus/SetList'
import { useWorkoutFocus } from './focus/useWorkoutFocus'
import { RestTimerSheet } from './RestTimerSheet'

export function WorkoutFocusView({ onFinish }: { onFinish: (log: WorkoutHistoryLog) => void }) {
  const navigate = useNavigate()
  const focus = useWorkoutFocus(onFinish)
  const { session, index, planExercise, exercise, doneSets, lastSet } = focus
  const [techniqueOpen, setTechniqueOpen] = useState(false)

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
        {planExercise && exercise ? (
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
                <IconButton label="Техніка виконання" icon={<Info />} onClick={() => setTechniqueOpen(true)} className="border border-line" />
              </div>
              <p className="font-mono text-sm text-fg-muted tabular">
                Ціль: {planExercise.sets} × {planExercise.reps}
                {planExercise.weight ? ` · ${planExercise.weight} кг` : ''} · відпочинок {planExercise.restSeconds} с
              </p>
              {planExercise.notes && <p className="border-l-2 border-accent pl-3 text-sm text-fg-muted">{planExercise.notes}</p>}
            </div>

            <SetList target={planExercise} done={doneSets} onUndo={focus.undoLastSet} />

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
                onDone={focus.completeCurrentSet}
              />
            ) : focus.isLastExercise ? (
              <Button size="lg" className="h-14 w-full text-base" onClick={focus.finish} icon={<Check className="!size-5" />}>
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

      <Modal isOpen={techniqueOpen} onClose={() => setTechniqueOpen(false)} title={exercise?.name} maxWidth="2xl">
        {exercise && <ExerciseMotionPlayer exercise={exercise} showTabSwitcher />}
      </Modal>
    </div>
  )
}
