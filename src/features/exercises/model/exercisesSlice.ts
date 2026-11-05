import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { Equipment, Exercise, ExerciseFilters, ExercisesState, Joint, MuscleGroup } from './types'
import { exercisesApi } from '../api/exercisesApi'
import { searchText } from '../lib/variants'
import { matchesSearch } from '@/shared/lib/search'
import { loadFromSession, SESSION_KEYS } from '@/shared/storage/sessionStorage'

const initialFilters: ExerciseFilters = {
  muscleGroup: 'all',
  difficulty: 'all',
  equipment: [],
  limits: [],
  searchQuery: '',
}

// Equipment belongs to the account, so it comes from fetchExercises rather than the tab's saved filters
const { equipment: _ignored, limits: _alsoIgnored, ...sessionFilters } = loadFromSession<Partial<ExerciseFilters>>(SESSION_KEYS.EXERCISE_FILTERS, {})

const initialState: ExercisesState = {
  items: [],
  filteredItems: [],
  selectedExercise: null,
  filters: { ...initialFilters, ...sessionFilters },
  favorites: [],
  notes: {},
  status: 'idle',
  error: null,
}

function applyFilters(items: Exercise[], filters: ExerciseFilters): Exercise[] {
  return items.filter((item) => {
    if (filters.searchQuery.trim() && !matchesSearch(searchText(item), filters.searchQuery) && !matchesSearch(item.description, filters.searchQuery)) {
      return false
    }

    if (filters.muscleGroup !== 'all') {
      const hasMuscle = item.muscleGroups.includes(filters.muscleGroup as MuscleGroup)
      if (!hasMuscle) return false
    }

    if (filters.difficulty !== 'all' && item.difficulty !== filters.difficulty) {
      return false
    }

    if (filters.limits.length > 0 && item.stress?.some((joint) => filters.limits.includes(joint))) {
      return false
    }

    if (filters.equipment.length > 0 && !filters.equipment.includes(item.equipment)) {
      return false
    }

    return true
  })
}

export const fetchExercises = createAsyncThunk(
  'exercises/fetchExercises',
  async (_, { rejectWithValue }) => {
    try {
      const [items, favorites, equipment, notes, limits] = await Promise.all([
        exercisesApi.getExercises(),
        exercisesApi.getFavorites(),
        exercisesApi.getMyEquipment(),
        exercisesApi.getNotes(),
        exercisesApi.getMyLimits(),
      ])
      return { items, favorites, equipment, notes, limits }
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

export const setMyEquipment = createAsyncThunk('exercises/setMyEquipment', (equipment: Equipment[]) =>
  exercisesApi.saveMyEquipment(equipment),
)

export const setMyLimits = createAsyncThunk('exercises/setMyLimits', (limits: Joint[]) => exercisesApi.saveMyLimits(limits))

export const saveExerciseNote = createAsyncThunk('exercises/saveExerciseNote', ({ exerciseId, text }: { exerciseId: string; text: string }) =>
  exercisesApi.saveNote(exerciseId, text),
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
      .addCase(fetchExercises.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchExercises.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.favorites = action.payload.favorites
        state.filters.equipment = action.payload.equipment
        state.notes = action.payload.notes
        state.filters.limits = action.payload.limits
        state.filteredItems = applyFilters(action.payload.items, state.filters)
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Помилка завантаження'
      })
      .addCase(addCustomExercise.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]
        state.filteredItems = applyFilters(state.items, state.filters)
      })
      // Applied right away; saving only persists it
      .addCase(setMyEquipment.pending, (state, action) => {
        state.filters.equipment = action.meta.arg
        state.filteredItems = applyFilters(state.items, state.filters)
      })
      .addCase(setMyLimits.pending, (state, action) => {
        state.filters.limits = action.meta.arg
        state.filteredItems = applyFilters(state.items, state.filters)
      })
      .addCase(saveExerciseNote.fulfilled, (state, action) => {
        state.notes = action.payload
      })
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
