import { configureStore } from '@reduxjs/toolkit'
import exercisesReducer from '@/features/exercises/model/exercisesSlice'
import workoutPlanReducer from '@/features/workoutPlan/model/workoutPlanSlice'
import workoutSessionReducer from '@/features/workoutSession/model/workoutSessionSlice'
import progressReducer from '@/features/progress/model/progressSlice'
import profileReducer from '@/features/profile/model/profileSlice'
import themeReducer from '@/features/theme/model/themeSlice'

export const store = configureStore({
  reducer: {
    exercises: exercisesReducer,
    workoutPlan: workoutPlanReducer,
    workoutSession: workoutSessionReducer,
    progress: progressReducer,
    profile: profileReducer,
    theme: themeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
