import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { SEO } from '@/shared/seo/SEO'
import { fetchExercises } from '@/features/exercises/model/exercisesSlice'
import { logWorkoutAsync } from '@/features/progress/model/progressSlice'
import type { WorkoutHistoryLog } from '@/features/progress/model/types'
import { fetchPlans } from '@/features/workoutPlan/model/workoutPlanSlice'
import { SessionSummaryModal } from '@/features/workoutSession/components/SessionSummaryModal'
import { WorkoutFocusView } from '@/features/workoutSession/components/WorkoutFocusView'
import { WorkoutLauncher } from '@/features/workoutSession/components/WorkoutLauncher'
import { finishWorkout } from '@/features/workoutSession/model/workoutSessionSlice'

export function ActiveWorkoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isActive = useAppSelector((state) => state.workoutSession.isActive)
  const plansCount = useAppSelector((state) => state.workoutPlan.plans.length)
  const exercisesCount = useAppSelector((state) => state.exercises.items.length)
  const [summary, setSummary] = useState<WorkoutHistoryLog | null>(null)

  useEffect(() => {
    if (plansCount === 0) dispatch(fetchPlans())
    if (exercisesCount === 0) dispatch(fetchExercises())
  }, [dispatch, plansCount, exercisesCount])

  const handleSave = async () => {
    if (!summary) return
    await dispatch(logWorkoutAsync(summary)).unwrap()
    dispatch(finishWorkout())
    setSummary(null)
    toast.success('Тренування збережено')
    navigate('/progress', { state: { justFinished: true } })
  }

  const handleDiscard = () => {
    dispatch(finishWorkout())
    setSummary(null)
  }

  return (
    <>
      <SEO title={isActive ? 'Активне тренування' : 'Тренування'} description="Фіксація підходів, ваги та таймер відпочинку." />
      {/* Portal: the animated <main> creates a stacking context that would trap this fixed layer */}
      {isActive ? createPortal(<WorkoutFocusView onFinish={setSummary} />, document.body) : <WorkoutLauncher />}
      <SessionSummaryModal
        isOpen={!!summary}
        workoutLog={summary}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onResume={() => setSummary(null)}
      />
    </>
  )
}
