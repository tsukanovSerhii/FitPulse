import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { Exercise, ExerciseFilters, ExercisesState, MuscleGroup } from './types'
import { exercisesApi } from '../api/exercisesApi'

const initialFilters: ExerciseFilters = {
  muscleGroup: 'all',
  difficulty: 'all',
  equipment: 'all',
  searchQuery: '',
}

const initialState: ExercisesState = {
  items: [],
  filteredItems: [],
  selectedExercise: null,
  filters: initialFilters,
  favorites: [],
  status: 'idle',
  error: null,
}

// Допоміжна функція фільтрації
function applyFilters(items: Exercise[], filters: ExerciseFilters): Exercise[] {
  return items.filter((item) => {
    // Пошук за назвою або описом
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim()
      const matchName = item.name.toLowerCase().includes(q)
      const matchDesc = item.description.toLowerCase().includes(q)
      if (!matchName && !matchDesc) return false
    }

    // Фільтр за групою м'язів
    if (filters.muscleGroup !== 'all') {
      const hasMuscle = item.muscleGroups.includes(filters.muscleGroup as MuscleGroup)
      if (!hasMuscle) return false
    }

    // Фільтр за складністю
    if (filters.difficulty !== 'all' && item.difficulty !== filters.difficulty) {
      return false
    }

    // Фільтр за обладнанням
    if (filters.equipment !== 'all' && item.equipment !== filters.equipment) {
      return false
    }

    return true
  })
}

// Async Thunks
export const fetchExercises = createAsyncThunk(
  'exercises/fetchExercises',
  async (_, { rejectWithValue }) => {
    try {
      const [items, favorites] = await Promise.all([
        exercisesApi.getExercises(),
        exercisesApi.getFavorites(),
      ])
      return { items, favorites }
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Не вдалося завантажити вправи')
    }
  },
)

export const addCustomExercise = createAsyncThunk(
  'exercises/addCustomExercise',
  async (exerciseData: Omit<Exercise, 'id'>, { rejectWithValue }) => {
    try {
      const newExercise = await exercisesApi.createExercise(exerciseData)
      return newExercise
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка створення вправи')
    }
  },
)

export const toggleFavorite = createAsyncThunk(
  'exercises/toggleFavorite',
  async (exerciseId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { exercises: ExercisesState }
      const currentFavs = state.exercises.favorites
      const updated = currentFavs.includes(exerciseId)
        ? currentFavs.filter((id) => id !== exerciseId)
        : [...currentFavs, exerciseId]

      await exercisesApi.saveFavorites(updated)
      return updated
    } catch (err) {
      return rejectWithValue((err as Error).message || 'Помилка оновлення списку обраного')
    }
  },
)

export const exercisesSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    setFilter: (
      state,
      action: PayloadAction<Partial<ExerciseFilters>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload }
      state.filteredItems = applyFilters(state.items, state.filters)
    },
    resetFilters: (state) => {
      state.filters = initialFilters
      state.filteredItems = state.items
    },
    setSelectedExercise: (state, action: PayloadAction<Exercise | null>) => {
      state.selectedExercise = action.payload
    },
    clearSelectedExercise: (state) => {
      state.selectedExercise = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchExercises
      .addCase(fetchExercises.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.favorites = action.payload.favorites
        state.filteredItems = applyFilters(action.payload.items, state.filters)
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Помилка завантаження'
      })
      // addCustomExercise
      .addCase(addCustomExercise.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]
        state.filteredItems = applyFilters(state.items, state.filters)
      })
      // toggleFavorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.favorites = action.payload
      })
  },
})

export const {
  setFilter,
  resetFilters,
  setSelectedExercise,
  clearSelectedExercise,
} = exercisesSlice.actions

export default exercisesSlice.reducer
