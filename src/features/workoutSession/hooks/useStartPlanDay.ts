import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { DAY_LABELS, type DayOfWeek } from '@/features/workoutPlan/model/types'
import { startWorkout } from '../model/workoutSessionSlice'

/** Starts a workout from one day of a saved plan and opens the workout screen. */
export function useStartPlanDay() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const plans = useAppSelector((state) => state.workoutPlan.plans)

  return (planId: string, day: DayOfWeek) => {
    const plan = plans.find((p) => p.id === planId)
    const exercises = plan?.schedule[day] ?? []
    if (!plan || exercises.length === 0) {
      toast.warning('У цьому дні ще немає вправ', { description: 'Додайте хоча б одну вправу перед початком.' })
      return
    }
    dispatch(startWorkout({ planId: plan.id, dayLabel: `${DAY_LABELS[day]} (${plan.name})`, exercises }))
    navigate('/workout')
  }
}
