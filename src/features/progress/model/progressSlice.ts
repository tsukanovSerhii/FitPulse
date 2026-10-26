import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { ProgressState, WorkoutHistoryLog } from './types'
import { progressApi } from '../api/progressApi'

const initialState: ProgressState = {
  history: [],
  personalRecords: {},
  status: 'idle',
  error: null,
}

// Async Thunks
export const fetchProgress = createAsyncThunk(
  'progress/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const data = await progressApi.getProgressData()
      return data
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Не вдалося завантажити прогрес')
    }
  },
)

export const logWorkoutAsync = createAsyncThunk(
  'progress/logWorkoutAsync',
  async (log: WorkoutHistoryLog, { rejectWithValue }) => {
    try {
      const result = await progressApi.saveWorkoutLog(log)
      return result
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка збереження тренування')
    }
  },
)

export const deleteWorkoutLogAsync = createAsyncThunk(
  'progress/deleteWorkoutLogAsync',
  async (logId: string, { rejectWithValue }) => {
    try {
      const result = await progressApi.deleteWorkoutLog(logId)
      return result
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка видалення запису')
    }
  },
)

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchProgress
      .addCase(fetchProgress.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.history = action.payload.history
        state.personalRecords = action.payload.personalRecords
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Помилка завантаження прогресу'
      })
      // logWorkoutAsync
      .addCase(logWorkoutAsync.fulfilled, (state, action) => {
        state.history.unshift(action.payload.log)
        state.personalRecords = action.payload.personalRecords
      })
      // deleteWorkoutLogAsync
      .addCase(deleteWorkoutLogAsync.fulfilled, (state, action) => {
        state.history = state.history.filter((item) => item.id !== action.payload.deletedId)
        state.personalRecords = action.payload.personalRecords
      })
  },
})

export default progressSlice.reducer
