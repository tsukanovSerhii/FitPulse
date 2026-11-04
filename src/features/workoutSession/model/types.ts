import type { PlanExercise } from '@/features/workoutPlan'

/** warmup sets stay out of the log, targets and records; drop and failure are working sets */
export type SetKind = 'warmup' | 'drop' | 'failure'

export interface CompletedSet {
  reps: number
  weight?: number
  completedAt: string
  kind?: SetKind
  /** Rate of perceived exertion, 6-10 */
  rpe?: number
}

export interface PlannedSet {
  weight: number
  reps: number
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
  /** Warm-up sets the user chose to do before the working sets, per session entry */
  warmups?: Record<string, PlannedSet[]>
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
