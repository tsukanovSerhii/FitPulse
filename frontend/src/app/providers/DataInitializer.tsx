import { useEffect, type ReactNode } from 'react'
import { fetchExercises } from '@/features/exercises/model'
import { fetchPlans } from '@/features/workoutPlan/model'
import { fetchProgress } from '@/features/progress/model'
import { fetchProfile } from '@/features/profile/model'
import { useThemeSync } from '@/features/theme'
import { useAppDispatch, useAppSelector } from '../store/hooks'

/** Loads the signed-in account's data (again after every change of user) and syncs the theme. */
export function DataInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const userId = useAppSelector((state) => state.auth.user?.id)
  useThemeSync()

  useEffect(() => {
    if (!userId) return
    dispatch(fetchExercises())
    dispatch(fetchPlans())
    dispatch(fetchProgress())
    dispatch(fetchProfile())
  }, [dispatch, userId])

  return children
}
