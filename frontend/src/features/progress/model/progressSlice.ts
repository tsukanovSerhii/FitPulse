import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { ProgressState, WorkoutHistoryLog } from './types'
import { DEFAULT_WEEKLY_GOAL, progressApi } from '../api/progressApi'

const initialState: ProgressState = {
  weeklyGoal: DEFAULT_WEEKLY_GOAL,
  history: [],
  personalRecords: {},
  status: 'idle',
  error: null,
}

export const fetchProgress = createAsyncThunk(
  'progress/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const [data, weeklyGoal] = await Promise.all([progressApi.getProgressData(), progressApi.getWeeklyGoal()])
      return { ...data, weeklyGoal }
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

export const setWeeklyGoal = createAsyncThunk('progress/setWeeklyGoal', (goal: number) => progressApi.saveWeeklyGoal(goal))

export const updateWorkoutLogAsync = createAsyncThunk(
  'progress/updateWorkoutLogAsync',
  async (log: WorkoutHistoryLog, { rejectWithValue }) => {
    try {
      return await progressApi.updateWorkoutLog(log)
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка збереження змін')
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
      .addCase(fetchProgress.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.history = action.payload.history
        state.personalRecords = action.payload.personalRecords
        state.weeklyGoal = action.payload.weeklyGoal
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Помилка завантаження прогресу'
      })
      .addCase(logWorkoutAsync.fulfilled, (state, action) => {
        state.history.unshift(action.payload.log)
        state.personalRecords = action.payload.personalRecords
      })
      .addCase(setWeeklyGoal.pending, (state, action) => {
        state.weeklyGoal = action.meta.arg
      })
      .addCase(updateWorkoutLogAsync.fulfilled, (state, action) => {
        const index = state.history.findIndex((item) => item.id === action.payload.log.id)
        if (index >= 0) state.history[index] = action.payload.log
        state.personalRecords = action.payload.personalRecords
      })
      .addCase(deleteWorkoutLogAsync.fulfilled, (state, action) => {
        state.history = state.history.filter((item) => item.id !== action.payload.deletedId)
        state.personalRecords = action.payload.personalRecords
      })
  },
})

export default progressSlice.reducer
