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

export const workoutPlanSlice = createSlice({
  name: 'workoutPlan',
  initialState,
  reducers: {
    setEditingDay: (state, action: PayloadAction<DayOfWeek | null>) => {
      state.editingDay = action.payload
    },

    addExerciseToDay: (
      state,
      action: PayloadAction<{ planId: string; day: DayOfWeek; exercise: Omit<PlanExercise, 'id' | 'order'> }>,
    ) => {
      const { planId, day, exercise } = action.payload
      const plan = state.plans.find((p) => p.id === planId)
      if (!plan) return

      if (!plan.schedule[day]) {
        plan.schedule[day] = []
      }

      const order = plan.schedule[day].length + 1
      const newPlanExercise: PlanExercise = {
        ...exercise,
        id: `plan-ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        order,
      }

      plan.schedule[day].push(newPlanExercise)
      plan.updatedAt = new Date().toISOString()
      plansApi.savePlan(plan) // автозбереження в фоні
    },

    removeExerciseFromDay: (
      state,
      action: PayloadAction<{ planId: string; day: DayOfWeek; exerciseId: string }>,
    ) => {
      const { planId, day, exerciseId } = action.payload
      const plan = state.plans.find((p) => p.id === planId)
      if (!plan || !plan.schedule[day]) return

      plan.schedule[day] = plan.schedule[day].filter((ex) => ex.id !== exerciseId)
      // Оновлюємо порядок
      plan.schedule[day].forEach((ex, idx) => {
        ex.order = idx + 1
      })
      plan.updatedAt = new Date().toISOString()
      plansApi.savePlan(plan)
    },

    updatePlanExercise: (
      state,
      action: PayloadAction<{
        planId: string
        day: DayOfWeek
        exerciseId: string
        updates: Partial<Pick<PlanExercise, 'sets' | 'reps' | 'weight' | 'restSeconds' | 'notes'>>
      }>,
    ) => {
      const { planId, day, exerciseId, updates } = action.payload
      const plan = state.plans.find((p) => p.id === planId)
      if (!plan || !plan.schedule[day]) return

      const ex = plan.schedule[day].find((item) => item.id === exerciseId)
      if (ex) {
        Object.assign(ex, updates)
        plan.updatedAt = new Date().toISOString()
        plansApi.savePlan(plan)
      }
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
  },
})

export const {
  setEditingDay,
  addExerciseToDay,
  removeExerciseFromDay,
  updatePlanExercise,
} = workoutPlanSlice.actions

export default workoutPlanSlice.reducer
