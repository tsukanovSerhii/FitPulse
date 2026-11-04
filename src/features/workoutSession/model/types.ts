import type { PlanExercise } from '@/features/workoutPlan'

/** drop and failure are working sets; warmup only appears in sessions saved by an earlier version */
export type SetKind = 'warmup' | 'drop' | 'failure'

export interface CompletedSet {
  reps: number
  weight?: number
  completedAt: string
  kind?: SetKind
  /** Rate of perceived exertion, 6-10 */
  rpe?: number
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
  /** The general warm-up before the first exercise was done or skipped */
  warmupDone?: boolean
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
