import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { WorkoutSessionState, CompletedSet } from './types'
import type { PlanExercise } from '@/features/workoutPlan/model/types'
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  STORAGE_KEYS,
} from '@/services/storage/localStorage'

const defaultInitialState: WorkoutSessionState = {
  isActive: false,
  planId: null,
  dayLabel: null,
  currentExerciseIndex: 0,
  exercises: [],
  completedSets: {},
  startTime: null,
  elapsedSeconds: 0,
  restTimer: {
    isRunning: false,
    totalSeconds: 60,
    remainingSeconds: 0,
  },
}

function getInitialSession(): WorkoutSessionState {
  const saved = loadFromStorage<WorkoutSessionState | null>(STORAGE_KEYS.ACTIVE_SESSION, null)
  if (saved && saved.isActive) {
    return {
      ...saved,
      restTimer: {
        ...saved.restTimer,
        isRunning: false,
      },
    }
  }
  return defaultInitialState
}

function persistSession(state: WorkoutSessionState) {
  if (state.isActive) {
    saveToStorage(STORAGE_KEYS.ACTIVE_SESSION, state)
  } else {
    removeFromStorage(STORAGE_KEYS.ACTIVE_SESSION)
  }
}

export const workoutSessionSlice = createSlice({
  name: 'workoutSession',
  initialState: getInitialSession(),
  reducers: {
    startWorkout: (
      state,
      action: PayloadAction<{
        planId: string | null
        dayLabel: string | null
        exercises: PlanExercise[]
      }>,
    ) => {
      state.isActive = true
      state.planId = action.payload.planId
      state.dayLabel = action.payload.dayLabel
      state.exercises = action.payload.exercises
      state.currentExerciseIndex = 0
      state.completedSets = {}
      state.startTime = Date.now()
      state.elapsedSeconds = 0
      state.restTimer = {
        isRunning: false,
        totalSeconds: 60,
        remainingSeconds: 0,
      }
      persistSession(state)
    },

    finishWorkout: (state) => {
      state.isActive = false
      state.planId = null
      state.dayLabel = null
      state.currentExerciseIndex = 0
      state.exercises = []
      state.completedSets = {}
      state.startTime = null
      state.elapsedSeconds = 0
      state.restTimer.isRunning = false
      persistSession(state)
    },

    cancelWorkout: (state) => {
      state.isActive = false
      state.planId = null
      state.dayLabel = null
      state.currentExerciseIndex = 0
      state.exercises = []
      state.completedSets = {}
      state.startTime = null
      state.elapsedSeconds = 0
      state.restTimer.isRunning = false
      persistSession(state)
    },

    completeSet: (
      state,
      action: PayloadAction<{
        planExerciseId: string
        set: CompletedSet
        autoStartRest?: boolean
        restSeconds?: number
      }>,
    ) => {
      const { planExerciseId, set, autoStartRest = true, restSeconds = 60 } = action.payload

      // Валідація значень: заборона від'ємних повторень та ваги
      const safeReps = Math.max(1, Math.min(500, Math.round(Number(set.reps)) || 1))
      const safeWeight =
        set.weight !== undefined && set.weight !== null && !isNaN(Number(set.weight))
          ? Math.max(0, Math.min(1000, Number(set.weight)))
          : undefined

      const cleanSet: CompletedSet = {
        reps: safeReps,
        weight: safeWeight,
        completedAt: set.completedAt || new Date().toISOString(),
      }

      if (!state.completedSets[planExerciseId]) {
        state.completedSets[planExerciseId] = []
      }
      state.completedSets[planExerciseId].push(cleanSet)

      if (autoStartRest) {
        state.restTimer = {
          isRunning: true,
          totalSeconds: restSeconds,
          remainingSeconds: restSeconds,
        }
      }
      persistSession(state)
    },

    removeCompletedSet: (
      state,
      action: PayloadAction<{ planExerciseId: string; setIndex: number }>,
    ) => {
      const { planExerciseId, setIndex } = action.payload
      if (state.completedSets[planExerciseId]) {
        state.completedSets[planExerciseId].splice(setIndex, 1)
      }
      persistSession(state)
    },

    setCurrentExerciseIndex: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.exercises.length) {
        state.currentExerciseIndex = action.payload
      }
      persistSession(state)
    },

    nextExercise: (state) => {
      if (state.currentExerciseIndex < state.exercises.length - 1) {
        state.currentExerciseIndex += 1
      }
      persistSession(state)
    },

    previousExercise: (state) => {
      if (state.currentExerciseIndex > 0) {
        state.currentExerciseIndex -= 1
      }
      persistSession(state)
    },

    tickWorkoutTimer: (state) => {
      if (state.isActive) {
        state.elapsedSeconds += 1
        // Періодично зберігаємо сесію (кожні 5 секунд або при оновленні)
        if (state.elapsedSeconds % 5 === 0) {
          persistSession(state)
        }
      }
    },

    startRestTimer: (state, action: PayloadAction<number | undefined>) => {
      const seconds = action.payload || 60
      state.restTimer = {
        isRunning: true,
        totalSeconds: seconds,
        remainingSeconds: seconds,
      }
      persistSession(state)
    },

    tickRestTimer: (state) => {
      if (state.restTimer.isRunning) {
        if (state.restTimer.remainingSeconds > 1) {
          state.restTimer.remainingSeconds -= 1
        } else {
          // Завершення відліку: обнуляємо та вимикаємо статус запуску
          state.restTimer.remainingSeconds = 0
          state.restTimer.isRunning = false
        }
      }
      persistSession(state)
    },

    setRestDuration: (state, action: PayloadAction<number>) => {
      const seconds = Math.max(60, action.payload)
      state.restTimer.totalSeconds = seconds
      state.restTimer.remainingSeconds = seconds
      state.restTimer.isRunning = false
      persistSession(state)
    },

    pauseRestTimer: (state) => {
      state.restTimer.isRunning = false
      persistSession(state)
    },

    resumeRestTimer: (state) => {
      if (state.restTimer.remainingSeconds > 0) {
        state.restTimer.isRunning = true
      }
      persistSession(state)
    },

    toggleRestTimer: (state) => {
      if (state.restTimer.remainingSeconds > 0) {
        state.restTimer.isRunning = !state.restTimer.isRunning
      }
      persistSession(state)
    },

    addRestSeconds: (state, action: PayloadAction<number>) => {
      const delta = action.payload || 30
      if (state.restTimer.remainingSeconds > 0) {
        state.restTimer.remainingSeconds += delta
        state.restTimer.totalSeconds = Math.max(
          state.restTimer.totalSeconds,
          state.restTimer.remainingSeconds,
        )
      } else {
        const seconds = Math.max(60, delta)
        state.restTimer.totalSeconds = seconds
        state.restTimer.remainingSeconds = seconds
        state.restTimer.isRunning = false
      }
      persistSession(state)
    },

    subtractRestSeconds: (state, action: PayloadAction<number>) => {
      const delta = action.payload || 30
      if (state.restTimer.remainingSeconds > 60) {
        state.restTimer.remainingSeconds = Math.max(60, state.restTimer.remainingSeconds - delta)
      } else if (state.restTimer.remainingSeconds > delta) {
        state.restTimer.remainingSeconds -= delta
      } else {
        state.restTimer.remainingSeconds = Math.max(30, state.restTimer.remainingSeconds - delta)
      }
      state.restTimer.totalSeconds = Math.max(
        state.restTimer.totalSeconds,
        state.restTimer.remainingSeconds,
      )
      persistSession(state)
    },

    skipRestTimer: (state) => {
      state.restTimer.isRunning = false
      state.restTimer.remainingSeconds = 0
      persistSession(state)
    },
  },
})

export const {
  startWorkout,
  finishWorkout,
  cancelWorkout,
  completeSet,
  removeCompletedSet,
  setCurrentExerciseIndex,
  nextExercise,
  previousExercise,
  tickWorkoutTimer,
  startRestTimer,
  setRestDuration,
  pauseRestTimer,
  resumeRestTimer,
  toggleRestTimer,
  tickRestTimer,
  addRestSeconds,
  subtractRestSeconds,
  skipRestTimer,
} = workoutSessionSlice.actions

export default workoutSessionSlice.reducer