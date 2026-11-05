import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { WorkoutSessionState, CompletedSet, SessionMode } from './types'
import type { PlanExercise } from '@/features/workoutPlan'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { loadUserData, removeUserData, saveUserData } from '@/shared/storage/userStorage'

const defaultInitialState: WorkoutSessionState = {
  isActive: false,
  mode: 'plan',
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
    endsAt: null,
  },
}

/*
 * Timers follow the wall clock: the workout keeps its start time and a running rest its end time,
 * and each tick only recomputes the seconds from them. A phone with the screen off pauses or slows
 * page timers, so counting ticks used to freeze both clocks until the screen came back.
 */
const secondsSince = (start: number, now: number) => Math.max(0, Math.floor((now - start) / 1000))
const secondsUntil = (end: number, now: number) => Math.max(0, Math.ceil((end - now) / 1000))

type RestTimer = WorkoutSessionState['restTimer']

function runRest(timer: RestTimer, seconds: number, now: number) {
  timer.isRunning = true
  timer.totalSeconds = seconds
  timer.remainingSeconds = seconds
  timer.endsAt = now + seconds * 1000
}

/** Brings remainingSeconds up to date with the wall clock and stops a rest that has run out. */
function syncRest(timer: RestTimer, now: number) {
  if (!timer.isRunning) return
  // Sessions saved before endsAt existed continue from the seconds they had left
  timer.endsAt ??= now + timer.remainingSeconds * 1000
  timer.remainingSeconds = secondsUntil(timer.endsAt, now)
  if (timer.remainingSeconds === 0) {
    timer.isRunning = false
    timer.endedAt = timer.endsAt
    timer.endsAt = null
  }
}

function getInitialSession(): WorkoutSessionState {
  const saved = loadUserData<WorkoutSessionState | null>(STORAGE_KEYS.ACTIVE_SESSION, null)
  if (!saved || !saved.isActive) return defaultInitialState
  const now = Date.now()
  const restTimer = { ...saved.restTimer }
  // A rest saved without an end time cannot know how long the app was closed, so it waits paused
  if (restTimer.isRunning && restTimer.endsAt) syncRest(restTimer, now)
  else restTimer.isRunning = false
  return {
    ...saved,
    elapsedSeconds: saved.startTime ? secondsSince(saved.startTime, now) : saved.elapsedSeconds,
    restTimer,
  }
}

function persistSession(state: WorkoutSessionState) {
  if (state.isActive) {
    saveUserData(STORAGE_KEYS.ACTIVE_SESSION, state)
  } else {
    removeUserData(STORAGE_KEYS.ACTIVE_SESSION)
  }
}

export const workoutSessionSlice = createSlice({
  name: 'workoutSession',
  // Lazy: re-read for the signed-in account whenever the state is reset
  initialState: getInitialSession,
  reducers: {
    startWorkout: (
      state,
      action: PayloadAction<{
        planId: string | null
        dayLabel: string | null
        exercises: PlanExercise[]
        mode?: SessionMode
        deload?: boolean
      }>,
    ) => {
      state.isActive = true
      state.mode = action.payload.mode ?? 'plan'
      state.deload = action.payload.deload ?? false
      state.planId = action.payload.planId
      state.dayLabel = action.payload.dayLabel
      state.exercises = action.payload.exercises
      state.currentExerciseIndex = 0
      state.completedSets = {}
      state.warmupDone = false
      state.startTime = Date.now()
      state.elapsedSeconds = 0
      state.restTimer = { isRunning: false, totalSeconds: 60, remainingSeconds: 0, endsAt: null }
      persistSession(state)
    },

    finishWorkout: (state) => {
      state.isActive = false
      state.mode = 'plan'
      state.planId = null
      state.dayLabel = null
      state.currentExerciseIndex = 0
      state.exercises = []
      state.completedSets = {}
      state.warmupDone = false
      state.startTime = null
      state.elapsedSeconds = 0
      state.restTimer.isRunning = false
      persistSession(state)
    },

    cancelWorkout: (state) => {
      state.isActive = false
      state.mode = 'plan'
      state.planId = null
      state.dayLabel = null
      state.currentExerciseIndex = 0
      state.exercises = []
      state.completedSets = {}
      state.warmupDone = false
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

      const safeReps = Math.max(1, Math.min(500, Math.round(Number(set.reps)) || 1))
      const safeWeight =
        set.weight !== undefined && set.weight !== null && !isNaN(Number(set.weight))
          ? Math.max(0, Math.min(1000, Number(set.weight)))
          : undefined

      const cleanSet: CompletedSet = {
        reps: safeReps,
        weight: safeWeight,
        completedAt: set.completedAt || new Date().toISOString(),
        ...(set.kind && { kind: set.kind }),
        ...(set.rpe && { rpe: Math.max(6, Math.min(10, set.rpe)) }),
      }

      if (!state.completedSets[planExerciseId]) {
        state.completedSets[planExerciseId] = []
      }
      state.completedSets[planExerciseId].push(cleanSet)

      if (autoStartRest) runRest(state.restTimer, restSeconds, Date.now())
      persistSession(state)
    },

    /** Free workout: adds an exercise and makes it the current one. */
    addSessionExercise: (state, action: PayloadAction<Omit<PlanExercise, 'order'>>) => {
      state.exercises.push({ ...action.payload, order: state.exercises.length + 1 })
      state.currentExerciseIndex = state.exercises.length - 1
      persistSession(state)
    },

    /** Free workout: drops an exercise added by mistake. Exercises with logged sets stay. */
    removeSessionExercise: (state, action: PayloadAction<string>) => {
      const index = state.exercises.findIndex((e) => e.id === action.payload)
      if (index < 0 || state.completedSets[action.payload]?.length) return
      state.exercises.splice(index, 1)
      state.exercises.forEach((e, i) => (e.order = i + 1))
      delete state.completedSets[action.payload]
      if (state.currentExerciseIndex >= index) state.currentExerciseIndex = Math.max(0, state.currentExerciseIndex - 1)
      persistSession(state)
    },

    /** Swaps the exercise of an entry, e.g. when the machine is busy. Only before any set is logged. */
    replaceSessionExercise: (
      state,
      action: PayloadAction<{ id: string; exerciseId: string; weight?: number; reps?: number; restSeconds?: number }>,
    ) => {
      const { id, exerciseId, weight, reps, restSeconds } = action.payload
      const entry = state.exercises.find((e) => e.id === id)
      if (!entry || state.completedSets[id]?.length) return
      entry.exerciseId = exerciseId
      entry.weight = weight
      if (reps) entry.reps = reps
      if (restSeconds) entry.restSeconds = restSeconds
      persistSession(state)
    },

    /** Hides the general warm-up: done, skipped or no longer needed once a set is logged. */
    finishWarmup: (state) => {
      state.warmupDone = true
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
      if (state.isActive && state.startTime) state.elapsedSeconds = secondsSince(state.startTime, Date.now())
    },

    startRestTimer: (state, action: PayloadAction<number | undefined>) => {
      runRest(state.restTimer, action.payload || 60, Date.now())
      persistSession(state)
    },

    tickRestTimer: (state) => {
      const wasRunning = state.restTimer.isRunning
      syncRest(state.restTimer, Date.now())
      // The end time is already saved; only a finished rest changes what a reload should see
      if (wasRunning && !state.restTimer.isRunning) persistSession(state)
    },

    setRestDuration: (state, action: PayloadAction<number>) => {
      const seconds = Math.max(60, action.payload)
      state.restTimer = { isRunning: false, totalSeconds: seconds, remainingSeconds: seconds, endsAt: null }
      persistSession(state)
    },

    pauseRestTimer: (state) => {
      syncRest(state.restTimer, Date.now())
      state.restTimer.isRunning = false
      state.restTimer.endsAt = null
      persistSession(state)
    },

    resumeRestTimer: (state) => {
      const timer = state.restTimer
      if (!timer.isRunning && timer.remainingSeconds > 0) {
        timer.isRunning = true
        timer.endsAt = Date.now() + timer.remainingSeconds * 1000
      }
      persistSession(state)
    },

    toggleRestTimer: (state) => {
      const now = Date.now()
      syncRest(state.restTimer, now)
      const timer = state.restTimer
      if (timer.isRunning) {
        timer.isRunning = false
        timer.endsAt = null
      } else if (timer.remainingSeconds > 0) {
        timer.isRunning = true
        timer.endsAt = now + timer.remainingSeconds * 1000
      }
      persistSession(state)
    },

    addRestSeconds: (state, action: PayloadAction<number>) => {
      const delta = action.payload || 30
      const timer = state.restTimer
      const now = Date.now()
      syncRest(timer, now)
      if (timer.remainingSeconds > 0) {
        timer.remainingSeconds += delta
        timer.totalSeconds = Math.max(timer.totalSeconds, timer.remainingSeconds)
        if (timer.isRunning) timer.endsAt = now + timer.remainingSeconds * 1000
      } else {
        const seconds = Math.max(60, delta)
        state.restTimer = { isRunning: false, totalSeconds: seconds, remainingSeconds: seconds, endsAt: null }
      }
      persistSession(state)
    },

    subtractRestSeconds: (state, action: PayloadAction<number>) => {
      const delta = action.payload || 30
      const timer = state.restTimer
      const now = Date.now()
      syncRest(timer, now)
      if (timer.remainingSeconds > 60) {
        timer.remainingSeconds = Math.max(60, timer.remainingSeconds - delta)
      } else if (timer.remainingSeconds > delta) {
        timer.remainingSeconds -= delta
      } else {
        timer.remainingSeconds = Math.max(30, timer.remainingSeconds - delta)
      }
      timer.totalSeconds = Math.max(timer.totalSeconds, timer.remainingSeconds)
      if (timer.isRunning) timer.endsAt = now + timer.remainingSeconds * 1000
      persistSession(state)
    },

    skipRestTimer: (state) => {
      state.restTimer.isRunning = false
      state.restTimer.remainingSeconds = 0
      state.restTimer.endsAt = null
      persistSession(state)
    },
  },
})

export const {
  startWorkout,
  finishWorkout,
  cancelWorkout,
  completeSet,
  addSessionExercise,
  removeSessionExercise,
  replaceSessionExercise,
  finishWarmup,
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