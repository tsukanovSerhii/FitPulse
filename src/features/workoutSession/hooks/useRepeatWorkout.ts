import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import type { WorkoutHistoryLog } from '@/features/progress'
import { exercisesFromLog } from '../lib/repeat'
import { startWorkout } from '../model/workoutSessionSlice'

/** Starts a workout with the same exercises, sets and weights as a finished one. */
export function useRepeatWorkout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const catalog = useAppSelector((state) => state.exercises.items)

  return (log: WorkoutHistoryLog) => {
    dispatch(startWorkout({ planId: log.planId ?? null, dayLabel: log.dayLabel || log.planName, exercises: exercisesFromLog(log, catalog) }))
    navigate('/workout')
  }
}
