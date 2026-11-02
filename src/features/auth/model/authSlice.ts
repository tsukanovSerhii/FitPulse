import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { updateProfileAsync } from '@/features/profile/model/profileSlice'
import { INITIAL_PROFILE } from '@/services/mockData/initialProfile'
import { authApi, AuthError } from '../api/authApi'
import type { AuthState, AuthUser, Credentials, RegistrationData } from './types'

const errorMessage = (err: unknown) => (err instanceof AuthError ? err.message : 'Щось пішло не так. Спробуйте ще раз')

export const registerUser = createAsyncThunk<AuthUser, RegistrationData, { rejectValue: string }>(
  'auth/register',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const user = await authApi.register(data)
      await dispatch(
        updateProfileAsync({ ...INITIAL_PROFILE, name: user.name, email: user.email, joinedDate: user.createdAt }),
      )
      return user
    } catch (err) {
      return rejectWithValue(errorMessage(err))
    }
  },
)

export const loginUser = createAsyncThunk<AuthUser, Credentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authApi.login(credentials)
    } catch (err) {
      return rejectWithValue(errorMessage(err))
    }
  },
)

const initialState: AuthState = {
  user: authApi.currentUser(),
  status: 'idle',
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedOut: (state) => {
      state.user = null
    },
    userUpdated: (state, action: { payload: AuthUser }) => {
      state.user = action.payload
    },
    authErrorCleared: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    for (const thunk of [registerUser, loginUser]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading'
          state.error = null
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'idle'
          state.user = action.payload
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed'
          state.error = action.payload ?? 'Помилка авторизації'
        })
    }
  },
})

const { loggedOut, userUpdated } = authSlice.actions
export const { authErrorCleared } = authSlice.actions

export const logout = () => {
  authApi.logout()
  return loggedOut()
}

export const setAvatar = (userId: string, avatarUrl: string | undefined) => userUpdated(authApi.updateUser(userId, { avatarUrl }))

export const syncAccount = (userId: string, changes: { name?: string; email?: string }) =>
  userUpdated(authApi.updateUser(userId, changes))

export default authSlice.reducer
