import { useEffect, type ReactNode } from 'react'
import { fetchExercises } from '@/features/exercises/model/exercisesSlice'
import { fetchPlans } from '@/features/workoutPlan/model/workoutPlanSlice'
import { fetchProgress } from '@/features/progress/model/progressSlice'
import { fetchProfile } from '@/features/profile/model/profileSlice'
import { useThemeSync } from '@/features/theme/hooks/useTheme'
import { useAppDispatch } from '../store/hooks'

/** Loads app data once and keeps the theme in sync with the system. */
export function DataInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  useThemeSync()

  useEffect(() => {
    dispatch(fetchExercises())
    dispatch(fetchPlans())
    dispatch(fetchProgress())
    dispatch(fetchProfile())
  }, [dispatch])

  return children
}
