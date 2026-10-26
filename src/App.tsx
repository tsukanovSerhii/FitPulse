import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { useAppDispatch } from './app/hooks'
import { fetchExercises } from './features/exercises/model/exercisesSlice'
import { fetchPlans } from './features/workoutPlan/model/workoutPlanSlice'
import { fetchProgress } from './features/progress/model/progressSlice'
import { fetchProfile } from './features/profile/model/profileSlice'

const DataInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch()

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
      </DataInitializer>
    </BrowserRouter>
  )
}

export default App
