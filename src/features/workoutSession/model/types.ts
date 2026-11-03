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
  }
}
