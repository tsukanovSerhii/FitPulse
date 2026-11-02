import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Info, RotateCcw } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { ExerciseMotionPlayer } from '@/components/common/ExerciseMotionPlayer'
import { Button, IconButton, Modal, NumberStepper, confirmAction } from '@/components/ui'
import { MUSCLE_GROUP_LABELS } from '@/features/exercises/model/types'
import type { WorkoutHistoryLog } from '@/features/progress/model/types'
import { formatDuration } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { buildWorkoutLog, formatSessionTitle } from '../lib/summary'
import { useWakeLock } from '../lib/useWakeLock'
import {
  cancelWorkout,
  completeSet,
  removeCompletedSet,
  setCurrentExerciseIndex,
  tickWorkoutTimer,
} from '../model/workoutSessionSlice'
import { RestTimerSheet } from './RestTimerSheet'

interface ActiveSetProps {
  setNumber: number
  initialWeight?: number
  initialReps: number
  showWeight: boolean
  onDone: (weight: number | undefined, reps: number) => void
}

/** Поточний підхід: степери ваги й повторів. Ключ компонента скидає чернетку після кожного підходу. */
function ActiveSet({ setNumber, initialWeight, initialReps, showWeight, onDone }: ActiveSetProps) {
  const [weight, setWeight] = useState(initialWeight ?? 0)
  const [reps, setReps] = useState(initialReps)

  return (
    <div className="space-y-4">
      <div className={cn('grid gap-4', showWeight && 'sm:grid-cols-2')}>
        {showWeight && (
          <NumberStepper label="Вага" unit="кг" value={weight} onChange={setWeight} step={2.5} max={500} decimals={1} />
        )}
        <NumberStepper label="Повтори" value={reps} onChange={setReps} step={1} min={1} max={100} />
      </div>
      <Button
        size="lg"
        className="h-14 w-full text-base"
        icon={<Check className="!size-5" />}
        onClick={() => onDone(showWeight ? weight : undefined, reps)}
      >
        Підхід {setNumber} виконано
      </Button>
    </div>
  )
}

export function WorkoutFocusView({ onFinish }: { onFinish: (log: WorkoutHistoryLog) => void }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const session = useAppSelector((state) => state.workoutSession)
  const exercises = useAppSelector((state) => state.exercises.items)
  const [techniqueOpen, setTechniqueOpen] = useState(false)

  useWakeLock(session.isActive)

  useEffect(() => {
    const id = window.setInterval(() => dispatch(tickWorkoutTimer()), 1000)
    return () => clearInterval(id)
  }, [dispatch])

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])
  const index = session.currentExerciseIndex
  const planExercise = session.exercises[index]
  const exercise = planExercise ? exerciseMap.get(planExercise.exerciseId) : undefined
  const doneSets = planExercise ? session.completedSets[planExercise.id] || [] : []
  const lastSet = doneSets[doneSets.length - 1]
  const exerciseComplete = planExercise ? doneSets.length >= planExercise.sets : false
  const isLastExercise = index === session.exercises.length - 1

  const totalSets = session.exercises.reduce((sum, e) => sum + e.sets, 0)
  const totalDone = session.exercises.reduce((sum, e) => sum + Math.min(e.sets, session.completedSets[e.id]?.length || 0), 0)

  const showWeight = Boolean(planExercise?.weight) || exercise?.equipment !== 'bodyweight'

  const nextHint = (() => {
    if (!planExercise) return undefined
    if (!exerciseComplete) {
      const w = lastSet?.weight ?? planExercise.weight
      return `підхід ${doneSets.length + 1} · ${w ? `${w} кг × ` : ''}${lastSet?.reps ?? planExercise.reps}`
    }
    const next = session.exercises[index + 1]
    return next ? exerciseMap.get(next.exerciseId)?.name : undefined
  })()

  const goTo = (i: number) => dispatch(setCurrentExerciseIndex(i))

  const handleSetDone = (weight: number | undefined, reps: number) => {
    if (!planExercise) return
    dispatch(
      completeSet({
        planExerciseId: planExercise.id,
        set: { reps, weight, completedAt: new Date().toISOString() },
        autoStartRest: !(isLastExercise && doneSets.length + 1 >= planExercise.sets),
        restSeconds: planExercise.restSeconds,
      }),
    )
  }

  const handleUndo = () => {
    if (planExercise && doneSets.length > 0) {
      dispatch(removeCompletedSet({ planExerciseId: planExercise.id, setIndex: doneSets.length - 1 }))
    }
  }

  const handleFinish = async () => {
    if (totalDone === 0) {
      const cancel = await confirmAction({
        title: 'Жодного підходу не виконано',
        description: 'Скасувати тренування без збереження?',
        confirmLabel: 'Скасувати тренування',
        cancelLabel: 'Продовжити',
        destructive: true,
      })
      if (cancel) dispatch(cancelWorkout())
      return
    }
    if (totalDone < totalSets) {
      const ok = await confirmAction({
        title: 'Завершити тренування?',
        description: `Виконано ${totalDone} з ${totalSets} підходів.`,
        confirmLabel: 'Завершити',
        cancelLabel: 'Продовжити',
      })
      if (!ok) return
    }
    onFinish(buildWorkoutLog(session, (id) => exerciseMap.get(id)?.name || 'Вправа'))
  }

  const handleCancel = async () => {
    const ok = await confirmAction({
      title: 'Скасувати тренування?',
      description: 'Виконані підходи не буде збережено.',
      confirmLabel: 'Скасувати тренування',
      cancelLabel: 'Продовжити',
      destructive: true,
    })
    if (ok) dispatch(cancelWorkout())
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <header className="border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-2 px-3">
          <IconButton label="Згорнути тренування" icon={<ChevronDown />} onClick={() => navigate('/')} />
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-xs text-fg-subtle">{formatSessionTitle(session.dayLabel)}</p>
            <p className="font-mono text-lg font-semibold leading-tight text-fg tabular">{formatDuration(session.elapsedSeconds)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleFinish} className="text-accent hover:text-accent">
            Завершити
          </Button>
        </div>
        <ol className="mx-auto flex max-w-lg gap-1 px-4 pb-3" aria-label="Вправи тренування">
          {session.exercises.map((e, i) => {
            const done = Math.min(e.sets, session.completedSets[e.id]?.length || 0)
            return (
              <li key={e.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Вправа ${i + 1}: ${exerciseMap.get(e.exerciseId)?.name ?? ''}, ${done} з ${e.sets}`}
                  aria-current={i === index ? 'step' : undefined}
                  className="block w-full cursor-pointer py-1.5"
                >
                  <span className={cn('block h-1 overflow-hidden rounded-full bg-line', i === index && 'ring-1 ring-accent ring-offset-1 ring-offset-bg')}>
                    <span className="block h-full bg-accent transition-[width] duration-300" style={{ width: `${(done / e.sets) * 100}%` }} />
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </header>

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

            <ol className="divide-y divide-line rounded-lg border border-line bg-surface">
              {Array.from({ length: planExercise.sets }, (_, i) => {
                const set = doneSets[i]
                const isCurrent = i === doneSets.length
                return (
                  <li key={i} className={cn('flex h-12 items-center gap-3 px-4 text-sm', isCurrent && 'bg-accent-soft')}>
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs',
                        set ? 'bg-accent text-on-accent' : isCurrent ? 'border border-accent text-accent' : 'border border-line text-fg-subtle',
                      )}
                    >
                      {set ? <Check className="size-3.5" aria-label="виконано" /> : i + 1}
                    </span>
                    <span className={cn('flex-1 font-mono tabular', set ? 'text-fg' : 'text-fg-subtle')}>
                      {set
                        ? `${set.weight ? `${set.weight} кг × ` : ''}${set.reps}`
                        : `${planExercise.weight ? `${planExercise.weight} кг × ` : ''}${planExercise.reps}`}
                    </span>
                    {set && i === doneSets.length - 1 && (
                      <button
                        type="button"
                        onClick={handleUndo}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-fg-subtle hover:text-fg"
                      >
                        <RotateCcw className="size-3.5" aria-hidden="true" />
                        Скасувати
                      </button>
                    )}
                  </li>
                )
              })}
            </ol>

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => goTo(index - 1)} icon={<ChevronLeft />}>
                Попередня
              </Button>
              <Button variant="ghost" size="sm" disabled={isLastExercise} onClick={() => goTo(index + 1)}>
                Наступна <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="mx-auto block cursor-pointer text-xs font-semibold text-fg-subtle hover:text-danger"
            >
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
            {!exerciseComplete ? (
              <ActiveSet
                key={`${planExercise.id}-${doneSets.length}`}
                setNumber={doneSets.length + 1}
                initialWeight={lastSet?.weight ?? planExercise.weight}
                initialReps={lastSet?.reps ?? planExercise.reps}
                showWeight={showWeight}
                onDone={handleSetDone}
              />
            ) : isLastExercise ? (
              <Button size="lg" className="h-14 w-full text-base" onClick={handleFinish} icon={<Check className="!size-5" />}>
                Завершити тренування
              </Button>
            ) : (
              <Button size="lg" className="h-14 w-full text-base" onClick={() => goTo(index + 1)}>
                Наступна вправа <ChevronRight className="size-5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </footer>
      )}

      <RestTimerSheet nextHint={nextHint} />

      <Modal isOpen={techniqueOpen} onClose={() => setTechniqueOpen(false)} title={exercise?.name} maxWidth="2xl">
        {exercise && <ExerciseMotionPlayer exercise={exercise} showTabSwitcher />}
      </Modal>
    </div>
  )
}
