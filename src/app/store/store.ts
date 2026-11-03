import { configureStore } from '@reduxjs/toolkit'
import { exercisesReducer } from '@/features/exercises/model'
import { workoutPlanReducer } from '@/features/workoutPlan/model'
import { workoutSessionReducer } from '@/features/workoutSession/model'
import { progressReducer } from '@/features/progress/model'
import { profileReducer } from '@/features/profile/model'
import { themeReducer } from '@/features/theme/model'
import { authReducer } from '@/features/auth/model'
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
