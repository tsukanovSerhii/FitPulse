import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { ProfileState, UserProfile } from './types'
import { profileApi } from '../api/profileApi'
import { INITIAL_PROFILE } from '@/services/mockData/initialProfile'

const initialState: ProfileState = {
  profile: INITIAL_PROFILE,
  status: 'idle',
  error: null,
}

// Async Thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await profileApi.getProfile()
      return data
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Не вдалося завантажити профіль')
    }
  },
)

export const updateProfileAsync = createAsyncThunk(
  'profile/updateProfileAsync',
  async (profile: UserProfile, { rejectWithValue }) => {
    try {
      const updated = await profileApi.updateProfile(profile)
      return updated
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка оновлення профілю')
    }
  },
)

export const resetProfileAsync = createAsyncThunk(
  'profile/resetProfileAsync',
  async (_, { rejectWithValue }) => {
    try {
      const reset = await profileApi.resetProfile()
      return reset
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка скидання профілю')
    }
  },
)

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.profile = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Помилка завантаження'
      })
      // updateProfileAsync
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      // resetProfileAsync
      .addCase(resetProfileAsync.fulfilled, (state, action) => {
        state.profile = action.payload
      })
  },
})

export default profileSlice.reducer
