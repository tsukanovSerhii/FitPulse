import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlayCircle,
  StopCircle,
  XCircle,
  Timer,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  startWorkout,
  finishWorkout,
  cancelWorkout,
  completeSet,
  removeCompletedSet,
  nextExercise,
  previousExercise,
  tickWorkoutTimer,
} from '@/features/workoutSession/model/workoutSessionSlice'
import { logWorkoutAsync } from '@/features/progress/model/progressSlice'
import type { CompletedSet } from '@/features/workoutSession/model/types'
import type { WorkoutHistoryLog, ExerciseSummary } from '@/features/progress/model/types'
import { ALL_DAYS, DAY_LABELS, type DayOfWeek, type PlanExercise } from '@/features/workoutPlan/model/types'
import { RestTimerWidget } from '@/features/workoutSession/components/RestTimerWidget'
import { SetLoggerRow } from '@/features/workoutSession/components/SetLoggerRow'
import { SessionSummaryModal } from '@/features/workoutSession/components/SessionSummaryModal'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { formatDuration } from '@/utils/formatters'

export const ActiveWorkoutPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const session = useAppSelector((state) => state.workoutSession)
  const plans = useAppSelector((state) => state.workoutPlan.plans)
  const allExercises = useAppSelector((state) => state.exercises.items)

  const [showInstructions, setShowInstructions] = useState(false)
  const [finishedSummary, setFinishedSummary] = useState<WorkoutHistoryLog | null>(null)

  // Quick start picker state (when no active workout)
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '')
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday')

  // Workout stopwatch timer effect
  useEffect(() => {
    let interval: number | null = null
    if (session.isActive) {
      interval = window.setInterval(() => {
        dispatch(tickWorkoutTimer())
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [session.isActive, dispatch])

  // Exercise map
  const exerciseMap = React.useMemo(() => {
    const map = new Map<string, (typeof allExercises)[0]>()
    allExercises.forEach((e) => map.set(e.id, e))
    return map
  }, [allExercises])

  // Current exercise in active workout
  const currentPlanExercise: PlanExercise | undefined =
    session.exercises[session.currentExerciseIndex]
  const currentExerciseData = currentPlanExercise
    ? exerciseMap.get(currentPlanExercise.exerciseId)
    : undefined

  const currentExerciseSets = currentPlanExercise
    ? session.completedSets[currentPlanExercise.id] || []
    : []

  // Handle start from plan
  const handleStartFromPlan = () => {
    const plan = plans.find((p) => p.id === selectedPlanId)
    if (!plan) return
    const exercises = plan.schedule[selectedDay] || []
    if (exercises.length === 0) {
      alert(`У дні ${DAY_LABELS[selectedDay]} немає призначених вправ. Оберіть інший день або додайте вправи в розділі «Плани».`)
      return
    }

    dispatch(
      startWorkout({
        planId: plan.id,
        dayLabel: `${DAY_LABELS[selectedDay]} (${plan.name})`,
        exercises,
      }),
    )
  }

  // Handle quick workout (first 4 catalog exercises)
  const handleStartQuickWorkout = () => {
    if (allExercises.length === 0) return
    const sample = allExercises.slice(0, 4).map((ex, idx) => ({
      id: `quick-ex-${idx}`,
      exerciseId: ex.id,
      sets: ex.defaultSets,
      reps: ex.defaultReps,
      restSeconds: ex.defaultRestSeconds,
      order: idx + 1,
    }))

    dispatch(
      startWorkout({
        planId: null,
        dayLabel: 'Експрес тренування',
        exercises: sample,
      }),
    )
  }

  const handleCancelWorkout = () => {
    if (window.confirm('Ви дійсно бажаєте зупинити тренування? Всі поточні підходи будуть скасовані.')) {
      dispatch(cancelWorkout())
    }
  }

  const handleCompleteSet = (set: CompletedSet, restSeconds: number) => {
    if (!currentPlanExercise) return
    dispatch(
      completeSet({
        planExerciseId: currentPlanExercise.id,
        set,
        autoStartRest: true,
        restSeconds,
      }),
    )
  }

  const handleRemoveSet = (setIndex: number) => {
    if (!currentPlanExercise) return
    dispatch(
      removeCompletedSet({
        planExerciseId: currentPlanExercise.id,
        setIndex,
      }),
    )
  }

  // Finish Workout calculation
  const handleFinishWorkout = () => {
    let totalSets = 0
    let totalReps = 0
    let totalVolumeKg = 0
    const summaries: ExerciseSummary[] = []

    for (const pEx of session.exercises) {
      const sets = session.completedSets[pEx.id] || []
      if (sets.length > 0) {
        let exReps = 0
        let exMaxWeight = 0

        for (const s of sets) {
          totalSets += 1
          totalReps += s.reps
          exReps += s.reps
          const w = s.weight || 0
          totalVolumeKg += s.reps * w
          if (w > exMaxWeight) exMaxWeight = w
        }

        const exData = exerciseMap.get(pEx.exerciseId)
        summaries.push({
          exerciseId: pEx.exerciseId,
          exerciseName: exData?.name || 'Вправа',
          setsCompleted: sets.length,
          totalReps: exReps,
          maxWeightKg: exMaxWeight > 0 ? exMaxWeight : undefined,
        })
      }
    }

    // Estimate calories burned: ~6 kcal/min * duration
    const minutes = Math.max(1, Math.round(session.elapsedSeconds / 60))
    const caloriesBurned = minutes * 7

    const log: WorkoutHistoryLog = {
      id: `workout-${Date.now()}`,
      planId: session.planId,
      planName: session.dayLabel || 'Індивідуальне тренування',
      dayLabel: session.dayLabel,
      date: new Date().toISOString(),
      durationSeconds: session.elapsedSeconds,
      totalSets,
      totalReps,
      totalVolumeKg,
      caloriesBurned,
      exercises: summaries,
    }

    setFinishedSummary(log)
  }

  const handleSaveFinishedLog = async () => {
    if (finishedSummary) {
      await dispatch(logWorkoutAsync(finishedSummary)).unwrap()
      dispatch(finishWorkout())
      setFinishedSummary(null)
      navigate('/progress')
    }
  }

  const handleDiscardFinishedLog = () => {
    dispatch(finishWorkout())
    setFinishedSummary(null)
  }

  // =========================================================================
  // VIEW: NO ACTIVE WORKOUT -> Selection Screen
  // =========================================================================
  if (!session.isActive) {
    const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0]

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-4">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto mb-2">
            <PlayCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Почати тренування
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Оберіть день з існуючої програми або запустіть швидку тренувальну сесію
          </p>
        </div>

        {/* Start from active plan */}
        <Card className="border-border/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-purple-400" />
            Запустити тренування за планом
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Оберіть програму
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Оберіть день тижня
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {ALL_DAYS.map((d) => {
                  const count = selectedPlan?.schedule[d]?.length || 0
                  const isSelected = selectedDay === d
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDay(d)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                          : count > 0
                          ? 'bg-surface hover:bg-slate-800 text-slate-200 border-border'
                          : 'bg-surface/30 text-slate-500 border-border/40 opacity-60'
                      }`}
                    >
                      <span className="block text-xs font-bold">{DAY_LABELS[d].slice(0, 2)}</span>
                      <span className="block text-[10px] mt-0.5">{count} впр</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartFromPlan}
                icon={<PlayCircle className="w-5 h-5" />}
                className="w-full"
              >
                Почати тренування ({DAY_LABELS[selectedDay]})
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Workout Alternative */}
        <Card className="border-border/80 flex items-center justify-between p-5">
          <div>
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Швидкий старт (Full Body мікс)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Запустити експрес-сесію з базовими 4 вправами без розкладу
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleStartQuickWorkout}>
            Старт
          </Button>
        </Card>
      </div>
    )
  }

  // =========================================================================
  // VIEW: ACTIVE WORKOUT IN PROGRESS
  // =========================================================================
  const totalExercises = session.exercises.length
  const currentIdx = session.currentExerciseIndex

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Session Status Bar */}
      <div className="glass border border-purple-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center animate-pulse">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
              {session.dayLabel || 'Активне тренування'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-purple-300 font-mono font-bold">
                Час: {formatDuration(session.elapsedSeconds)}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                Вправа {currentIdx + 1} з {totalExercises}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-center justify-end">
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancelWorkout}
            icon={<XCircle className="w-4 h-4" />}
          >
            Скасувати
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handleFinishWorkout}
            icon={<StopCircle className="w-4 h-4" />}
          >
            Завершити тренування
          </Button>
        </div>
      </div>

      {/* Rest Timer Widget (countdown + audio beep) */}
      <RestTimerWidget />

      {/* Main Exercise Card */}
      {currentPlanExercise && currentExerciseData ? (
        <Card className="border-border/80 space-y-5">
          {/* Navigator Header */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-border/60">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentIdx === 0}
              onClick={() => dispatch(previousExercise())}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Назад
            </Button>

            <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Вправа {currentIdx + 1} / {totalExercises}
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={currentIdx === totalExercises - 1}
              onClick={() => dispatch(nextExercise())}
            >
              Далі <ChevronRight className="w-4 h-4 ml-1 inline" />
            </Button>
          </div>

          {/* Exercise Info */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-100">
                  {currentExerciseData.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge variant="primary" size="sm">
                    {currentExerciseData.primaryMuscle}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    Ціль: {currentPlanExercise.sets}x{currentPlanExercise.reps}
                    {currentPlanExercise.weight ? ` • ${currentPlanExercise.weight} кг` : ''}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    Відпочинок: {currentPlanExercise.restSeconds} сек
                  </Badge>
                </div>
              </div>

              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="p-2 rounded-xl text-slate-400 hover:text-purple-300 hover:bg-surface transition-colors shrink-0"
                title="Показати техніку"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {currentPlanExercise.notes && (
              <div className="mt-3 text-xs text-purple-300 bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20 italic">
                Вказівка: {currentPlanExercise.notes}
              </div>
            )}

            {/* Collapsible technique */}
            {showInstructions && currentExerciseData.instructions && (
              <div className="mt-3 p-3 bg-surface rounded-xl border border-border text-xs text-slate-300 space-y-1.5 animate-fade-in">
                <span className="font-bold text-slate-200 block">Техніка виконання:</span>
                {currentExerciseData.instructions.map((step) => (
                  <p key={step.step}>
                    {step.step}. {step.description}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Sets Logger */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Підходи та вага:
            </h4>

            {Array.from({ length: currentPlanExercise.sets }).map((_, idx) => {
              const setNum = idx + 1
              const loggedSet = currentExerciseSets[idx]

              return (
                <SetLoggerRow
                  key={idx}
                  setNumber={setNum}
                  targetReps={currentPlanExercise.reps}
                  targetWeight={currentPlanExercise.weight}
                  defaultRestSeconds={currentPlanExercise.restSeconds}
                  completedSet={loggedSet}
                  onComplete={handleCompleteSet}
                  onRemove={() => handleRemoveSet(idx)}
                />
              )
            })}
          </div>

          {/* Bottom stepper navigator bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <div className="text-xs text-slate-400">
              Виконано в цій вправі: <strong>{currentExerciseSets.length}</strong> з {currentPlanExercise.sets} сетів
            </div>

            {currentIdx < totalExercises - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => dispatch(nextExercise())}
              >
                Наступна вправа <ChevronRight className="w-4 h-4 ml-1 inline" />
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                onClick={handleFinishWorkout}
                icon={<StopCircle className="w-4 h-4" />}
              >
                Завершити тренування
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="text-center py-12 text-slate-400">
          У цьому тренуванні немає вправ.
        </div>
      )}

      {/* Summary Modal on Finish */}
      <SessionSummaryModal
        isOpen={!!finishedSummary}
        workoutLog={finishedSummary}
        onSave={handleSaveFinishedLog}
        onDiscard={handleDiscardFinishedLog}
      />
    </div>
  )
}
