import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { WorkoutPlan, WorkoutPlanState, DayOfWeek, PlanExercise } from './types'
import { plansApi } from '../api/plansApi'

const initialState: WorkoutPlanState = {
  plans: [],
  activePlanId: null,
  editingDay: null,
  status: 'idle',
  error: null,
}

// Async Thunks
export const fetchPlans = createAsyncThunk(
  'workoutPlan/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const data = await plansApi.getPlans()
      return data
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Не вдалося завантажити плани')
    }
  },
)

export const savePlanAsync = createAsyncThunk(
  'workoutPlan/savePlanAsync',
  async (plan: WorkoutPlan, { rejectWithValue }) => {
    try {
      const saved = await plansApi.savePlan(plan)
      return saved
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка збереження плану')
    }
  },
)

export const deletePlanAsync = createAsyncThunk(
  'workoutPlan/deletePlanAsync',
  async (planId: string, { rejectWithValue }) => {
    try {
      const deletedId = await plansApi.deletePlan(planId)
      return deletedId
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка видалення плану')
    }
  },
)

export const setActivePlanAsync = createAsyncThunk(
  'workoutPlan/setActivePlanAsync',
  async (planId: string, { rejectWithValue }) => {
    try {
      const id = await plansApi.setActivePlan(planId)
      return id
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка активації плану')
    }
  },
)

export const addExerciseToDay = createAsyncThunk(
  'workoutPlan/addExerciseToDay',
  async (
    payload: { planId: string; day: DayOfWeek; exercise: Omit<PlanExercise, 'id' | 'order'> },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { workoutPlan: WorkoutPlanState }
      const plan = state.workoutPlan.plans.find((p) => p.id === payload.planId)
      if (!plan) return rejectWithValue('План не знайдено')

      const cleanPlan: WorkoutPlan = JSON.parse(JSON.stringify(plan))
      if (!cleanPlan.schedule[payload.day]) {
        cleanPlan.schedule[payload.day] = []
      }
      const order = cleanPlan.schedule[payload.day].length + 1
      const newPlanExercise: PlanExercise = {
        ...payload.exercise,
        id: `plan-ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        order,
      }
      cleanPlan.schedule[payload.day].push(newPlanExercise)
      cleanPlan.updatedAt = new Date().toISOString()

      const saved = await plansApi.savePlan(cleanPlan)
      return saved
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка додавання вправи')
    }
  },
)

export const removeExerciseFromDay = createAsyncThunk(
  'workoutPlan/removeExerciseFromDay',
  async (
    payload: { planId: string; day: DayOfWeek; exerciseId: string },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { workoutPlan: WorkoutPlanState }
      const plan = state.workoutPlan.plans.find((p) => p.id === payload.planId)
      if (!plan || !plan.schedule[payload.day]) return rejectWithValue('План не знайдено')

      const cleanPlan: WorkoutPlan = JSON.parse(JSON.stringify(plan))
      cleanPlan.schedule[payload.day] = cleanPlan.schedule[payload.day].filter(
        (ex) => ex.id !== payload.exerciseId,
      )
      cleanPlan.schedule[payload.day].forEach((ex, idx) => {
        ex.order = idx + 1
      })
      cleanPlan.updatedAt = new Date().toISOString()

      const saved = await plansApi.savePlan(cleanPlan)
      return saved
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка видалення вправи')
    }
  },
)

export const updatePlanExercise = createAsyncThunk(
  'workoutPlan/updatePlanExercise',
  async (
    payload: {
      planId: string
      day: DayOfWeek
      exerciseId: string
      updates: Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds' | 'notes'>>
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { workoutPlan: WorkoutPlanState }
      const plan = state.workoutPlan.plans.find((p) => p.id === payload.planId)
      if (!plan || !plan.schedule[payload.day]) return rejectWithValue('План не знайдено')

      const cleanPlan: WorkoutPlan = JSON.parse(JSON.stringify(plan))
      const ex = cleanPlan.schedule[payload.day].find((item) => item.id === payload.exerciseId)
      if (ex) {
        Object.assign(ex, payload.updates)
        cleanPlan.updatedAt = new Date().toISOString()
      }

      const saved = await plansApi.savePlan(cleanPlan)
      return saved
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка оновлення вправи')
    }
  },
)

export const workoutPlanSlice = createSlice({
  name: 'workoutPlan',
  initialState,
  reducers: {
    setEditingDay: (state, action: PayloadAction<DayOfWeek | null>) => {
      state.editingDay = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPlans
      .addCase(fetchPlans.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.plans = action.payload.plans
        state.activePlanId = action.payload.activePlanId
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Помилка завантаження'
      })
      // savePlanAsync
      .addCase(savePlanAsync.fulfilled, (state, action) => {
        const index = state.plans.findIndex((p) => p.id === action.payload.id)
        if (index >= 0) {
          state.plans[index] = action.payload
        } else {
          state.plans.unshift(action.payload)
        }
        if (!state.activePlanId) {
          state.activePlanId = action.payload.id
        }
      })
      // deletePlanAsync
      .addCase(deletePlanAsync.fulfilled, (state, action) => {
        state.plans = state.plans.filter((p) => p.id !== action.payload)
        if (state.activePlanId === action.payload) {
          state.activePlanId = state.plans.length > 0 ? state.plans[0].id : null
        }
      })
      // setActivePlanAsync
      .addCase(setActivePlanAsync.fulfilled, (state, action) => {
        state.activePlanId = action.payload
      })
      // addExerciseToDay
      .addCase(addExerciseToDay.fulfilled, (state, action) => {
        const index = state.plans.findIndex((p) => p.id === action.payload.id)
        if (index >= 0) {
          state.plans[index] = action.payload
        }
      })
      // removeExerciseFromDay
      .addCase(removeExerciseFromDay.fulfilled, (state, action) => {
        const index = state.plans.findIndex((p) => p.id === action.payload.id)
        if (index >= 0) {
          state.plans[index] = action.payload
        }
      })
      // updatePlanExercise
      .addCase(updatePlanExercise.fulfilled, (state, action) => {
        const index = state.plans.findIndex((p) => p.id === action.payload.id)
        if (index >= 0) {
          state.plans[index] = action.payload
        }
      })
  },
})

export const { setEditingDay } = workoutPlanSlice.actions

export default workoutPlanSlice.reducer
