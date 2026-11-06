import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authApi, authErrorMessage } from '../api/authApi'
import type { AuthState, AuthUser, LoginData, RegistrationData } from './types'

type Rejected = { rejectValue: string }

export const registerUser = createAsyncThunk<AuthUser, RegistrationData, Rejected>('auth/register', async (data, { rejectWithValue }) => {
  try {
    return await authApi.register(data)
  } catch (err) {
    return rejectWithValue(authErrorMessage(err))
  }
})

export const loginUser = createAsyncThunk<AuthUser, LoginData, Rejected>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authApi.login(credentials)
  } catch (err) {
    return rejectWithValue(authErrorMessage(err))
  }
})

/** Checks the session with the server; offline keeps the cached user. */
export const restoreSession = createAsyncThunk('auth/restore', () => authApi.restore())

export const updateAccount = createAsyncThunk<AuthUser, { name?: string; email?: string; currentPassword?: string }, Rejected>(
  'auth/updateAccount',
  async (changes, { rejectWithValue }) => {
    try {
      return await authApi.updateProfile(changes)
    } catch (err) {
      return rejectWithValue(authErrorMessage(err))
    }
  },
)

export const requestPasswordReset = createAsyncThunk<void, string, Rejected>('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    await authApi.forgotPassword(email)
  } catch (err) {
    return rejectWithValue(authErrorMessage(err))
  }
})

export const resetPassword = createAsyncThunk<void, { token: string; password: string }, Rejected>(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      await authApi.resetPassword(token, password)
    } catch (err) {
      return rejectWithValue(authErrorMessage(err))
    }
  },
)

export const logout = createAsyncThunk('auth/logout', () => authApi.logout())

const initialState: AuthState = {
  user: authApi.cachedUser(),
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
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload === null) state.user = null
        else if (action.payload !== 'offline') state.user = action.payload
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.user = action.payload
      })
      // Signed out on this device at once, even before the server answers
      .addCase(logout.pending, (state) => {
        state.user = null
      })
  },
})

const { userUpdated } = authSlice.actions
export const { authErrorCleared, loggedOut } = authSlice.actions

export const setAvatar = (user: AuthUser, avatarUrl: string | undefined) => {
  authApi.setAvatar(avatarUrl)
  const { avatarUrl: _old, ...rest } = user
  return userUpdated(avatarUrl ? { ...rest, avatarUrl } : rest)
}

export default authSlice.reducer
