import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppRoutes } from './routes/AppRoutes'
import { useAppDispatch } from './app/hooks'
import { fetchExercises } from './features/exercises/model/exercisesSlice'
import { fetchPlans } from './features/workoutPlan/model/workoutPlanSlice'
import { fetchProgress } from './features/progress/model/progressSlice'
import { fetchProfile } from './features/profile/model/profileSlice'
import { useThemeSync } from './features/theme/lib/useTheme'

const DataInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch()
  useThemeSync()

  useEffect(() => {
    dispatch(fetchExercises())
    dispatch(fetchPlans())
    dispatch(fetchProgress())
    dispatch(fetchProfile())
  }, [dispatch])

  return <>{children}</>
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DataInitializer>
        <AppRoutes />
        <Toaster richColors position="bottom-right" closeButton />
      </DataInitializer>
    </BrowserRouter>
  )
}

export default App
