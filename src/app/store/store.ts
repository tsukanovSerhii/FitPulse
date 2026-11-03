import { combineReducers, configureStore, isAnyOf, type UnknownAction } from '@reduxjs/toolkit'
import { exercisesReducer } from '@/features/exercises/model'
import { workoutPlanReducer } from '@/features/workoutPlan/model'
import { workoutSessionReducer } from '@/features/workoutSession/model'
import { progressReducer } from '@/features/progress/model'
import { profileReducer } from '@/features/profile/model'
import { themeReducer } from '@/features/theme/model'
import { authReducer, loggedOut, loginUser, registerUser } from '@/features/auth/model'
import { listenerMiddleware } from './listeners'

const appReducer = combineReducers({
  exercises: exercisesReducer,
  workoutPlan: workoutPlanReducer,
  workoutSession: workoutSessionReducer,
  progress: progressReducer,
  profile: profileReducer,
  theme: themeReducer,
  auth: authReducer,
})

export type RootState = ReturnType<typeof appReducer>

/** Slices that hold one account's data; theme and auth survive a change of user. */
const USER_SLICES = ['exercises', 'workoutPlan', 'workoutSession', 'progress', 'profile'] as const

const isUserChange = isAnyOf(loggedOut, loginUser.fulfilled, registerUser.fulfilled)

// Undefined slice state makes each reducer rebuild its initial state for the new account.
function rootReducer(state: RootState | undefined, action: UnknownAction): RootState {
  if (state && isUserChange(action)) {
    const reset: Partial<RootState> = { ...state }
    for (const key of USER_SLICES) delete reset[key]
    return appReducer(reset, action)
  }
  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().prepend(listenerMiddleware.middleware),
})

export type AppDispatch = typeof store.dispatch
