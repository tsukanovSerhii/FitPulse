import { configureStore } from '@reduxjs/toolkit'
import exercisesReducer from '@/features/exercises/model/exercisesSlice'
import workoutPlanReducer from '@/features/workoutPlan/model/workoutPlanSlice'
import workoutSessionReducer from '@/features/workoutSession/model/workoutSessionSlice'
import progressReducer from '@/features/progress/model/progressSlice'
import profileReducer from '@/features/profile/model/profileSlice'
import themeReducer from '@/features/theme/model/themeSlice'
import authReducer from '@/features/auth/model/authSlice'
import { listenerMiddleware } from './listeners'

export const store = configureStore({
  reducer: {
    exercises: exercisesReducer,
    workoutPlan: workoutPlanReducer,
    workoutSession: workoutSessionReducer,
    progress: progressReducer,
    profile: profileReducer,
    theme: themeReducer,
    auth: authReducer,
  },
  middleware: (getDefault) => getDefault().prepend(listenerMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
