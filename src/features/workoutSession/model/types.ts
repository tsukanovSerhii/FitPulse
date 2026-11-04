import type { PlanExercise } from '@/features/workoutPlan'

export interface CompletedSet {
  reps: number
  weight?: number
  completedAt: string
}

/** plan: exercises and set counts come from a plan day; free: the user adds exercises as they go. */
export type SessionMode = 'plan' | 'free'

export interface WorkoutSessionState {
  isActive: boolean
  /** Missing in sessions saved before free workouts existed */
  mode?: SessionMode
  planId: string | null
  dayLabel: string | null
  currentExerciseIndex: number
  exercises: PlanExercise[]
  completedSets: Record<string, CompletedSet[]>
  startTime: number | null
  elapsedSeconds: number
  restTimer: {
    isRunning: boolean
    totalSeconds: number
    remainingSeconds: number
    /** Wall-clock end of a running rest, in ms; null while paused or stopped. Missing in older saved sessions */
    endsAt?: number | null
    /** When the last rest ran out on its own (not skipped), in ms; drives the end signal */
    endedAt?: number
  }
}
