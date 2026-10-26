import type { PlanExercise } from '@/features/workoutPlan/model/types'

// Виконаний підхід
export interface CompletedSet {
  reps: number
  weight?: number
  completedAt: string   // ISO timestamp
}

// Стан активного тренування
export interface WorkoutSessionState {
  isActive: boolean
  planId: string | null
  dayLabel: string | null
  currentExerciseIndex: number
  exercises: PlanExercise[]
  completedSets: Record<string, CompletedSet[]>   // { planExerciseId: [...] }
  startTime: number | null                         // Date.now()
  elapsedSeconds: number
  restTimer: {
    isRunning: boolean
    totalSeconds: number
    remainingSeconds: number
  }
}
