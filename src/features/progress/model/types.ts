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
  date: string                // ISO string
  durationSeconds: number
  totalSets: number
  totalReps: number
  totalVolumeKg: number       // сумарна піднята вага
  caloriesBurned: number
  exercises: ExerciseSummary[]
}

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  maxWeightKg: number
  maxReps: number
  achievedAt: string          // ISO string
}

export interface ProgressState {
  history: WorkoutHistoryLog[]
  personalRecords: Record<string, PersonalRecord> // key = exerciseId
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
