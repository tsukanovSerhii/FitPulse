import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppRoutes } from './routes/AppRoutes'
import { useAppDispatch, useAppSelector } from './app/hooks'
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

function ThemedToaster() {
  const theme = useAppSelector((state) => state.theme.resolved)
  return (
    <Toaster
      theme={theme}
      position="top-center"
      offset={16}
      toastOptions={{
        classNames: {
          toast: '!bg-surface !text-fg !border-line !rounded-lg !shadow-pop',
          description: '!text-fg-muted',
          success: '[&_[data-icon]]:!text-success',
          error: '[&_[data-icon]]:!text-danger',
          warning: '[&_[data-icon]]:!text-warning',
        },
      }}
    />
  )
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DataInitializer>
        <AppRoutes />
        <ThemedToaster />
      </DataInitializer>
    </BrowserRouter>
  )
}

export default App
