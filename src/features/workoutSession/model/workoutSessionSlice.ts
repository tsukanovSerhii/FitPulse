import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { WorkoutSessionState, CompletedSet } from './types'
import type { PlanExercise } from '@/features/workoutPlan/model/types'

const initialState: WorkoutSessionState = {
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

export const workoutSessionSlice = createSlice({
  name: 'workoutSession',
  initialState,
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
      if (!state.completedSets[planExerciseId]) {
        state.completedSets[planExerciseId] = []
      }
      state.completedSets[planExerciseId].push(set)

      if (autoStartRest) {
        state.restTimer = {
          isRunning: true,
          totalSeconds: restSeconds,
          remainingSeconds: restSeconds,
        }
      }
    },

    removeCompletedSet: (
      state,
      action: PayloadAction<{ planExerciseId: string; setIndex: number }>,
    ) => {
      const { planExerciseId, setIndex } = action.payload
      if (state.completedSets[planExerciseId]) {
        state.completedSets[planExerciseId].splice(setIndex, 1)
      }
    },

    setCurrentExerciseIndex: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.exercises.length) {
        state.currentExerciseIndex = action.payload
      }
    },

    nextExercise: (state) => {
      if (state.currentExerciseIndex < state.exercises.length - 1) {
        state.currentExerciseIndex += 1
      }
    },

    previousExercise: (state) => {
      if (state.currentExerciseIndex > 0) {
        state.currentExerciseIndex -= 1
      }
    },

    tickWorkoutTimer: (state) => {
      if (state.isActive) {
        state.elapsedSeconds += 1
      }
    },

    startRestTimer: (state, action: PayloadAction<number | undefined>) => {
      const seconds = action.payload || 60
      state.restTimer = {
        isRunning: true,
        totalSeconds: seconds,
        remainingSeconds: seconds,
      }
    },

    tickRestTimer: (state) => {
      if (state.restTimer.isRunning) {
        if (state.restTimer.remainingSeconds > 0) {
          state.restTimer.remainingSeconds -= 1
        } else {
          state.restTimer.isRunning = false
        }
      }
    },

    setRestDuration: (state, action: PayloadAction<number>) => {
      const seconds = Math.max(60, action.payload)
      state.restTimer.totalSeconds = seconds
      state.restTimer.remainingSeconds = seconds
      // Не запускаємо таймер автоматично при налаштуванні часу!
    },

    pauseRestTimer: (state) => {
      state.restTimer.isRunning = false
    },

    resumeRestTimer: (state) => {
      if (state.restTimer.remainingSeconds > 0) {
        state.restTimer.isRunning = true
      }
    },

    toggleRestTimer: (state) => {
      if (state.restTimer.remainingSeconds > 0) {
        state.restTimer.isRunning = !state.restTimer.isRunning
      }
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
        // Завжди починаємо з цілих хвилин: мінімум 60 секунд (1 хвилина)
        const seconds = Math.max(60, delta)
        state.restTimer.totalSeconds = seconds
        state.restTimer.remainingSeconds = seconds
        // При встановленні часу таймер НЕ запускається сам — користувач просто вказує час!
        state.restTimer.isRunning = false
      }
    },

    subtractRestSeconds: (state, action: PayloadAction<number>) => {
      const delta = action.payload || 30
      // Якщо час більше хвилини — не даємо зменшити нижче 60с (1 хвилини),
      // щоб завжди зберігався вимір у хвилинах. Для скидання є кнопка «Пропустити»
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
      // При зменшенні часу статус запуску не змінюється автоматично!
    },

    skipRestTimer: (state) => {
      state.restTimer.isRunning = false
      state.restTimer.remainingSeconds = 0
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
