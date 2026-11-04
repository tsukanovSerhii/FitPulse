import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { confirmAction } from '@/shared/ui'
import type { Exercise } from '@/features/exercises/model'
import type { WorkoutHistoryLog } from '@/features/progress'
import { buildWorkoutLog, workingSets } from '../lib/summary'
import { lastPerformance } from '../lib/strength'
import { freeSessionExercise } from '../lib/freeWorkout'
import { restFor, useTimerSettings } from '../lib/timerSettings'
import { suggestNext } from '../lib/progression'
import { warmupSets } from '../lib/warmup'
import { nextInSuperset, supersetPosition } from '../lib/supersets'
import type { SetExtras } from '../components/focus/ActiveSetPanel'
import {
  addSessionExercise,
  cancelWorkout,
  completeSet,
  removeCompletedSet,
  removeSessionExercise,
  replaceSessionExercise,
  setCurrentExerciseIndex,
  setWarmup,
} from '../model/workoutSessionSlice'

/** Derived state and actions for the active workout screen. */
export function useWorkoutFocus(onFinish: (log: WorkoutHistoryLog) => void) {
  const dispatch = useAppDispatch()
  const session = useAppSelector((state) => state.workoutSession)
  const exercises = useAppSelector((state) => state.exercises.items)
  const history = useAppSelector((state) => state.progress.history)

  const isFree = session.mode === 'free'
  const timerSettings = useTimerSettings()
  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])
  const index = session.currentExerciseIndex
  const planExercise = session.exercises[index]
  const exercise = planExercise ? exerciseMap.get(planExercise.exerciseId) : undefined
  const allSets = planExercise ? session.completedSets[planExercise.id] || [] : []
  const doneSets = workingSets(allSets)
  const warmupDone = allSets.filter((s) => s.kind === 'warmup')
  const plannedWarmup = (planExercise && session.warmups?.[planExercise.id]) || []
  const inWarmup = doneSets.length === 0 && warmupDone.length < plannedWarmup.length
  const lastSet = doneSets[doneSets.length - 1]
  const previous = useMemo(() => (planExercise ? lastPerformance(history, planExercise.exerciseId) : null), [history, planExercise])
  const suggestion = !isFree && planExercise && exercise ? suggestNext(previous, planExercise, exercise) : null
  // Working sets start from the progression suggestion, then follow what the user just lifted
  const startWeight = lastSet?.weight ?? suggestion?.weight ?? planExercise?.weight
  const startReps = lastSet?.reps ?? suggestion?.reps ?? planExercise?.reps ?? 10
  const warmupOffer =
    planExercise && exercise && allSets.length === 0 && plannedWarmup.length === 0 && startWeight ? warmupSets(startWeight, exercise.equipment) : []
  const superset = supersetPosition(session.exercises, index)
  // A free workout has no set target: there is always one more set to log
  const exerciseComplete = planExercise && !isFree ? doneSets.length >= planExercise.sets : false
  const isLastExercise = index === session.exercises.length - 1
  const target = planExercise && {
    ...planExercise,
    ...(isFree && { sets: doneSets.length + 1, reps: lastSet?.reps ?? planExercise.reps, weight: lastSet?.weight ?? planExercise.weight }),
  }

  const progress = session.exercises.map((e) => {
    const done = workingSets(session.completedSets[e.id]).length
    const total = isFree ? Math.max(1, done) : e.sets
    return { id: e.id, name: exerciseMap.get(e.exerciseId)?.name ?? '', done: Math.min(total, done), total }
  })
  const totalSets = progress.reduce((sum, p) => sum + p.total, 0)
  const totalDone = progress.reduce((sum, p) => sum + p.done, 0)

  const nextHint = (() => {
    if (!planExercise) return undefined
    if (inWarmup) {
      const next = plannedWarmup[warmupDone.length]
      return `розминка · ${next.weight} кг × ${next.reps}`
    }
    if (!exerciseComplete) return `підхід ${doneSets.length + 1} · ${startWeight ? `${startWeight} кг × ` : ''}${startReps}`
    const next = session.exercises[index + 1]
    return next ? exerciseMap.get(next.exerciseId)?.name : undefined
  })()

  const goTo = (i: number) => dispatch(setCurrentExerciseIndex(i))

  const completeCurrentSet = (weight: number | undefined, reps: number, extras: SetExtras = {}) => {
    if (!planExercise) return
    const completedAt = new Date().toISOString()
    const rest = restFor(timerSettings, planExercise.restSeconds)

    if (inWarmup) {
      // Warm-ups are light: a short rest is enough
      dispatch(
        completeSet({
          planExerciseId: planExercise.id,
          set: { reps, weight, completedAt, kind: 'warmup' },
          autoStartRest: timerSettings.autoStart,
          restSeconds: Math.min(60, rest),
        }),
      )
      return
    }

    const done = Object.fromEntries(session.exercises.map((e) => [e.id, workingSets(session.completedSets[e.id]).length]))
    done[planExercise.id] += 1
    const finishesWorkout = !isFree && session.exercises.every((e) => done[e.id] >= e.sets)
    const step = isFree ? null : nextInSuperset(session.exercises, index, done)
    dispatch(
      completeSet({
        planExerciseId: planExercise.id,
        set: { reps, weight, completedAt, ...extras },
        autoStartRest: !finishesWorkout && timerSettings.autoStart && (step ? step.rest : true),
        restSeconds: rest,
      }),
    )
    if (step?.index != null && step.index !== index) goTo(step.index)
  }

  const startWarmup = () => {
    if (planExercise && warmupOffer.length > 0) dispatch(setWarmup({ entryId: planExercise.id, sets: warmupOffer }))
  }

  const skipWarmup = () => {
    if (planExercise) dispatch(setWarmup({ entryId: planExercise.id, sets: [] }))
  }

  const addExercise = (picked: Exercise) => {
    const existing = session.exercises.findIndex((e) => e.exerciseId === picked.id)
    if (existing >= 0) goTo(existing)
    else dispatch(addSessionExercise(freeSessionExercise(picked, history)))
  }

  const replaceCurrentExercise = (picked: Exercise) => {
    if (!planExercise || allSets.length > 0) return
    const last = lastPerformance(history, picked.id)
    dispatch(
      replaceSessionExercise({
        id: planExercise.id,
        exerciseId: picked.id,
        weight: last?.weightKg,
        // A free workout has no planned reps to keep
        ...(isFree && { reps: last?.reps ?? picked.defaultReps, restSeconds: picked.defaultRestSeconds }),
      }),
    )
  }

  const removeCurrentExercise = () => {
    if (planExercise && allSets.length === 0) dispatch(removeSessionExercise(planExercise.id))
  }

  const undoLastSet = () => {
    if (planExercise && allSets.length > 0) {
      dispatch(removeCompletedSet({ planExerciseId: planExercise.id, setIndex: allSets.length - 1 }))
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
    if (!isFree && totalDone < totalSets) {
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
    isFree,
    restSeconds: planExercise ? restFor(timerSettings, planExercise.restSeconds) : 0,
    index,
    planExercise,
    target,
    exercise,
    doneSets,
    allSets,
    warmupDone,
    plannedWarmup,
    inWarmup,
    warmupOffer,
    startWeight,
    startReps,
    suggestion,
    superset,
    lastSet,
    previous,
    exerciseComplete,
    isLastExercise,
    progress,
    nextHint,
    showWeight: Boolean(planExercise?.weight) || exercise?.equipment !== 'bodyweight',
    goTo,
    completeCurrentSet,
    startWarmup,
    skipWarmup,
    addExercise,
    replaceCurrentExercise,
    removeCurrentExercise,
    undoLastSet,
    finish,
    cancel,
  }
}
