import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { SEO } from '@/shared/seo/SEO'
import { fetchExercises } from '@/features/exercises'
import { logWorkoutAsync, type WorkoutHistoryLog } from '@/features/progress'
import { dayKeyOf, fetchPlans, usePlanActions } from '@/features/workoutPlan'
import { SessionSummaryModal, WorkoutFocusView, WorkoutLauncher, finishWorkout, planFromSession, type SaveAsPlan } from '@/features/workoutSession'
import { PAGE_META } from '../meta'

const shortDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' })

export function ActiveWorkoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const session = useAppSelector((state) => state.workoutSession)
  const isActive = session.isActive
  const planActions = usePlanActions()
  const plansCount = useAppSelector((state) => state.workoutPlan.plans.length)
  const exercisesCount = useAppSelector((state) => state.exercises.items.length)
  const [summary, setSummary] = useState<WorkoutHistoryLog | null>(null)

  useEffect(() => {
    if (plansCount === 0) dispatch(fetchPlans())
    if (exercisesCount === 0) dispatch(fetchExercises())
  }, [dispatch, plansCount, exercisesCount])

  const planDefaults =
    summary && session.mode === 'free'
      ? { name: `Моє тренування · ${shortDate.format(new Date(summary.date))}`, day: dayKeyOf(new Date(summary.date)) }
      : undefined

  const handleSave = async (asPlan: SaveAsPlan | null) => {
    if (!summary) return
    await dispatch(logWorkoutAsync(summary)).unwrap()
    if (asPlan) {
      const plan = planFromSession(session, asPlan)
      await planActions.save(plan)
      toast.success(`Тренування збережено, програму «${plan.name}» створено`, {
        action: { label: 'Програми', onClick: () => navigate('/plans') },
      })
    } else {
      toast.success('Тренування збережено')
    }
    dispatch(finishWorkout())
    setSummary(null)
    navigate('/progress', { state: { justFinished: true } })
  }

  const handleDiscard = () => {
    dispatch(finishWorkout())
    setSummary(null)
  }

  return (
    <>
      <SEO {...(isActive ? PAGE_META.activeWorkout : PAGE_META.workout)} />
      {/* Portal: the animated <main> creates a stacking context that would trap this fixed layer */}
      {isActive ? createPortal(<WorkoutFocusView onFinish={setSummary} />, document.body) : <WorkoutLauncher />}
      <SessionSummaryModal
        key={summary?.id ?? 'none'}
        isOpen={!!summary}
        workoutLog={summary}
        planDefaults={planDefaults}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onResume={() => setSummary(null)}
      />
    </>
  )
}
