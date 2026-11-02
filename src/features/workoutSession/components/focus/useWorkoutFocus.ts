import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { confirmAction } from '@/shared/ui'
import type { WorkoutHistoryLog } from '@/features/progress/model/types'
import { buildWorkoutLog } from '../../lib/summary'
import {
  cancelWorkout,
  completeSet,
  removeCompletedSet,
  setCurrentExerciseIndex,
  tickWorkoutTimer,
} from '../../model/workoutSessionSlice'

/** Derived state and actions for the active workout screen. */
export function useWorkoutFocus(onFinish: (log: WorkoutHistoryLog) => void) {
  const dispatch = useAppDispatch()
  const session = useAppSelector((state) => state.workoutSession)
  const exercises = useAppSelector((state) => state.exercises.items)

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

  const progress = session.exercises.map((e) => ({
    id: e.id,
    name: exerciseMap.get(e.exerciseId)?.name ?? '',
    done: Math.min(e.sets, session.completedSets[e.id]?.length || 0),
    total: e.sets,
  }))
  const totalSets = progress.reduce((sum, p) => sum + p.total, 0)
  const totalDone = progress.reduce((sum, p) => sum + p.done, 0)

  const nextHint = (() => {
    if (!planExercise) return undefined
    if (!exerciseComplete) {
      const weight = lastSet?.weight ?? planExercise.weight
      return `підхід ${doneSets.length + 1} · ${weight ? `${weight} кг × ` : ''}${lastSet?.reps ?? planExercise.reps}`
    }
    const next = session.exercises[index + 1]
    return next ? exerciseMap.get(next.exerciseId)?.name : undefined
  })()

  const goTo = (i: number) => dispatch(setCurrentExerciseIndex(i))

  const completeCurrentSet = (weight: number | undefined, reps: number) => {
    if (!planExercise) return
    const finishesWorkout = isLastExercise && doneSets.length + 1 >= planExercise.sets
    dispatch(
      completeSet({
        planExerciseId: planExercise.id,
        set: { reps, weight, completedAt: new Date().toISOString() },
        autoStartRest: !finishesWorkout,
        restSeconds: planExercise.restSeconds,
      }),
    )
  }

  const undoLastSet = () => {
    if (planExercise && doneSets.length > 0) {
      dispatch(removeCompletedSet({ planExerciseId: planExercise.id, setIndex: doneSets.length - 1 }))
    }
  }

  const finish = async () => {
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

  const cancel = async () => {
    const ok = await confirmAction({
      title: 'Скасувати тренування?',
      description: 'Виконані підходи не буде збережено.',
      confirmLabel: 'Скасувати тренування',
      cancelLabel: 'Продовжити',
      destructive: true,
    })
    if (ok) dispatch(cancelWorkout())
  }

  return {
    session,
    index,
    planExercise,
    exercise,
    doneSets,
    lastSet,
    exerciseComplete,
    isLastExercise,
    progress,
    nextHint,
    showWeight: Boolean(planExercise?.weight) || exercise?.equipment !== 'bodyweight',
    goTo,
    completeCurrentSet,
    undoLastSet,
    finish,
    cancel,
  }
}
