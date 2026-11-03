import type { PlanExercise } from '@/features/workoutPlan'

export interface CompletedSet {
  reps: number
  weight?: number
  completedAt: string
}

export interface WorkoutSessionState {
  isActive: boolean
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
