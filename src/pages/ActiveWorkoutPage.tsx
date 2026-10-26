import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play,
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
import { CancelWorkoutModal } from '@/features/workoutSession/components/CancelWorkoutModal'
import { ExerciseMotionPlayer } from '@/components/common/ExerciseMotionPlayer'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { formatDuration } from '@/utils/formatters'
import { updatePageSEO } from '@/utils/seo'

export const ActiveWorkoutPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const session = useAppSelector((state) => state.workoutSession)
  const plans = useAppSelector((state) => state.workoutPlan.plans)
  const allExercises = useAppSelector((state) => state.exercises.items)

  const [showInstructions, setShowInstructions] = useState(false)
  const [finishedSummary, setFinishedSummary] = useState<WorkoutHistoryLog | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [planWarning, setPlanWarning] = useState<string | null>(null)

  // Quick start picker state (when no active workout)
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '')
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday')

  // SEO setup
  useEffect(() => {
    updatePageSEO({
      title: session.isActive
        ? `Тренування: ${session.dayLabel || 'Активна сесія'} | FitPulse`
        : 'Почати тренування: секундомір, підходи, вага та таймер | FitPulse',
      description:
        'Інтерактивний трекер тренування: фіксація ваги та повторень, таймер відпочинку, анатомія та фази виконання вправ.',
      keywords: ['тренування онлайн', 'секундомір відпочинку', 'фіксація підходів у залі'],
    })
  }, [session.isActive, session.dayLabel])

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
      setPlanWarning(`У дні «${DAY_LABELS[selectedDay]}» немає запланованих вправ. Будь ласка, оберіть інший день або налаштуйте розклад у вкладці «Програми».`)
      return
    }
    setPlanWarning(null)

    // Remove any nested parenthetical notes from plan name to avoid double parentheses
    const cleanPlanName = plan.name.replace(/\s*\([^)]*\)/g, '').trim() || plan.name

    dispatch(
      startWorkout({
        planId: plan.id,
        dayLabel: `${DAY_LABELS[selectedDay]} • ${cleanPlanName}`,
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

  const handleConfirmCancel = () => {
    setShowCancelModal(false)
    dispatch(cancelWorkout())
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

    // Estimate calories burned: ~7 kcal/min * duration
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
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-sky-950/40">
            <Play className="w-8 h-8 fill-current translate-x-0.5" />
          </div>
          <h1 className="text-3xl font-black text-white">
            Почати тренування
          </h1>
          <p className="text-sm text-slate-400">
            Оберіть день з існуючої програми або запустіть експрес-сесію
          </p>
        </div>

        {/* Start from active plan */}
        <Card className="border-slate-800/80 bg-slate-900/80 p-6 space-y-5 shadow-xl">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-sky-400" />
            Запустити тренування за планом
          </h3>

          <div className="space-y-4">
            {planWarning && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{planWarning}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Оберіть програму
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => {
                  setSelectedPlanId(e.target.value)
                  setPlanWarning(null)
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Оберіть день тижня
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {ALL_DAYS.map((d) => {
                  const count = selectedPlan?.schedule[d]?.length || 0
                  const isSelected = selectedDay === d
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setSelectedDay(d)
                        setPlanWarning(null)
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-950/40'
                          : count > 0
                          ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-800'
                          : 'bg-slate-950/30 text-slate-500 border-slate-900 opacity-60'
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
                icon={<Play className="w-5 h-5 fill-white" />}
                className="w-full"
              >
                Почати тренування ({DAY_LABELS[selectedDay]})
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Workout Alternative */}
        <Card hover className="border-slate-800/80 bg-slate-900/80 flex items-center justify-between p-5 shadow-lg">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Швидкий старт (Full Body мікс)
            </h4>
            <p className="text-xs text-slate-400 mt-1">
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

  // Sanitize dayLabel: remove nested parenthetical info
  const sanitizedDayLabel = (() => {
    const raw = session.dayLabel || ''
    if (!raw) return 'Активне тренування'
    // "Понеділок (Push / Pull / Legs (3 дні на тиждень))" → "Понеділок • Push / Pull / Legs"
    const match = raw.match(/^([^(]+)\s*\((.+)\)\s*$/)
    if (match) {
      const day = match[1].trim()
      const inner = match[2].replace(/\s*\([^)]*\)/g, '').trim()
      return `${day} • ${inner}`
    }
    return raw
  })()

  // =========================================================================
  // VIEW: ACTIVE WORKOUT IN PROGRESS
  // =========================================================================
  const totalExercises = session.exercises.length
  const currentIdx = session.currentExerciseIndex

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Session Status Bar */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl border border-sky-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-lg shadow-sky-950/40 shrink-0">
            <Timer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {sanitizedDayLabel}
            </h2>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-xs sm:text-sm text-sky-300 font-mono font-bold bg-sky-500/15 px-2.5 py-0.5 rounded-md border border-sky-500/30">
                Час: {formatDuration(session.elapsedSeconds)}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-300 font-semibold">
                Вправа {currentIdx + 1} з {totalExercises}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end shrink-0">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            icon={<XCircle className="w-4 h-4" />}
            className="whitespace-nowrap"
          >
            Скасувати
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handleFinishWorkout}
            icon={<StopCircle className="w-4 h-4" />}
            className="whitespace-nowrap"
          >
            Завершити тренування
          </Button>
        </div>
      </div>

      {/* Rest Timer Widget (countdown + audio beep) */}
      <RestTimerWidget />

      {/* Main Exercise Card */}
      {currentPlanExercise && currentExerciseData ? (
        <Card className="border-slate-800/80 bg-slate-900/85 p-6 space-y-6 shadow-2xl">
          {/* Navigator Header */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentIdx === 0}
              onClick={() => dispatch(previousExercise())}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Назад
            </Button>

            <span className="text-xs font-bold text-sky-300 bg-sky-500/15 px-3 py-1 rounded-full border border-sky-500/30">
              Вправа {currentIdx + 1} з {totalExercises}
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
                <h3 className="text-2xl font-black text-white">
                  {currentExerciseData.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="primary" dot size="sm">
                    {currentExerciseData.primaryMuscle}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    Ціль: {currentPlanExercise.sets}×{currentPlanExercise.reps}
                    {currentPlanExercise.weight ? ` • ${currentPlanExercise.weight} кг` : ''}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    Відпочинок: {currentPlanExercise.restSeconds}с
                  </Badge>
                </div>
              </div>

              <Button
                variant={showInstructions ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
                icon={<HelpCircle className="w-4 h-4" />}
                className="text-xs shrink-0"
              >
                {showInstructions ? 'Сховати інструкцію' : 'Анатомія та техніка'}
              </Button>
            </div>

            {currentPlanExercise.notes && (
              <div className="mt-3 text-xs text-sky-300 bg-sky-500/10 p-3 rounded-xl border border-sky-500/20 italic">
                Вказівка: {currentPlanExercise.notes}
              </div>
            )}

            {/* Collapsible technique & anatomy hub */}
            {showInstructions && currentExerciseData && (
              <div className="mt-4 animate-fade-in">
                <ExerciseMotionPlayer
                  exercise={currentExerciseData}
                  showTabSwitcher={true}
                />
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
          <div className="flex items-center justify-between pt-5 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Виконано в цій вправі: <strong className="text-white">{currentExerciseSets.length}</strong> з {currentPlanExercise.sets} сетів
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

      {/* Cancel Confirmation Modal */}
      <CancelWorkoutModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
      />

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
