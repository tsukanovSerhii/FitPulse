import { createAction, createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { WorkoutPlan, WorkoutPlanState, DayOfWeek, PlanExercise } from './types'
import { plansApi } from '../api/plansApi'
import { applyPlanEdit, type ExerciseUpdates, type PlanEdit } from '../lib/planEdits'

const initialState: WorkoutPlanState = {
  plans: [],
  activePlanId: null,
  editingDay: null,
  status: 'idle',
  error: null,
}

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
      return await enqueueSave(() => plansApi.savePlan(plan))
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

// Plan edits change Redux right away and on the latest state; storage writes then run one at a time,
// each saving the plan as it is when the write starts. Two quick edits can no longer overwrite each other.
export const planEdited = createAction<{ planId: string; edit: PlanEdit }>('workoutPlan/planEdited')

let saveQueue: Promise<unknown> = Promise.resolve()

function enqueueSave<T>(save: () => Promise<T>): Promise<T> {
  const run = saveQueue.catch(() => undefined).then(save)
  saveQueue = run
  return run
}

const findPlan = (state: unknown, planId: string) =>
  (state as { workoutPlan: WorkoutPlanState }).workoutPlan.plans.find((p) => p.id === planId)

function editPlan(type: string, failure: string) {
  return createAsyncThunk(`workoutPlan/${type}`, async (payload: { planId: string; edit: PlanEdit }, { dispatch, getState, rejectWithValue }) => {
    if (!findPlan(getState(), payload.planId)) return rejectWithValue('План не знайдено')
    dispatch(planEdited(payload))
    try {
      await enqueueSave(async () => {
        const plan = findPlan(getState(), payload.planId)
        if (plan) await plansApi.savePlan(plan)
      })
    } catch (err) {
      return rejectWithValue((err as Error).message || failure)
    }
  })
}

const addThunk = editPlan('addExerciseToDay', 'Помилка додавання вправи')
const removeThunk = editPlan('removeExerciseFromDay', 'Помилка видалення вправи')
const updateThunk = editPlan('updatePlanExercise', 'Помилка оновлення вправи')

export const addExerciseToDay = (payload: { planId: string; day: DayOfWeek; exercise: Omit<PlanExercise, 'id' | 'order'> }) =>
  addThunk({
    planId: payload.planId,
    edit: {
      type: 'add',
      day: payload.day,
      exercise: { ...payload.exercise, id: `plan-ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, order: 0 },
    },
  })

export const removeExerciseFromDay = (payload: { planId: string; day: DayOfWeek; exerciseId: string }) =>
  removeThunk({ planId: payload.planId, edit: { type: 'remove', day: payload.day, exerciseId: payload.exerciseId } })

const linkThunk = editPlan('linkPlanExercises', 'Помилка створення суперсету')

export const toggleSuperset = (payload: { planId: string; day: DayOfWeek; exerciseId: string }) =>
  linkThunk({ planId: payload.planId, edit: { type: 'link', ...payload, groupId: `ss-${Date.now().toString(36)}` } })

export const updatePlanExercise = (payload: { planId: string; day: DayOfWeek; exerciseId: string; updates: ExerciseUpdates }) =>
  updateThunk({ planId: payload.planId, edit: { type: 'update', day: payload.day, exerciseId: payload.exerciseId, updates: payload.updates } })

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
      .addCase(deletePlanAsync.fulfilled, (state, action) => {
        state.plans = state.plans.filter((p) => p.id !== action.payload)
        if (state.activePlanId === action.payload) {
          state.activePlanId = state.plans.length > 0 ? state.plans[0].id : null
        }
      })
      .addCase(setActivePlanAsync.fulfilled, (state, action) => {
        state.activePlanId = action.payload
      })
      .addCase(planEdited, (state, { payload }) => {
        const plan = state.plans.find((p) => p.id === payload.planId)
        if (plan) applyPlanEdit(plan, payload.edit)
      })
  },
})

export const { setEditingDay } = workoutPlanSlice.actions

export default workoutPlanSlice.reducer
