import { useEffect, type ReactNode } from 'react'
import { fetchExercises } from '@/features/exercises/model'
import { fetchPlans } from '@/features/workoutPlan/model'
import { fetchProgress } from '@/features/progress/model'
import { fetchProfile } from '@/features/profile/model'
import { useThemeSync } from '@/features/theme'
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
