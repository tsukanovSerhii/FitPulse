export interface ExerciseSummary {
  exerciseId: string
  exerciseName: string
  setsCompleted: number
  totalReps: number
  maxWeightKg?: number
  repsAtMaxWeight?: number
}

export interface WorkoutHistoryLog {
  id: string
  planId?: string | null
  planName: string
  dayLabel?: string | null
  date: string
  durationSeconds: number
  totalSets: number
  totalReps: number
  totalVolumeKg: number
  caloriesBurned: number
  exercises: ExerciseSummary[]
}

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  maxWeightKg: number
  maxReps: number
  achievedAt: string
}

export interface ProgressState {
  history: WorkoutHistoryLog[]
  personalRecords: Record<string, PersonalRecord>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
