export interface LoggedSet {
  reps: number
  weight?: number
  kind?: 'drop' | 'failure'
  rpe?: number
}

export interface ExerciseSummary {
  exerciseId: string
  exerciseName: string
  setsCompleted: number
  totalReps: number
  maxWeightKg?: number
  repsAtMaxWeight?: number
  /** Working sets in order; missing in workouts logged before sets were kept */
  sets?: LoggedSet[]
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
  /** Workouts per week the user aims for */
  weeklyGoal: number
  history: WorkoutHistoryLog[]
  personalRecords: Record<string, PersonalRecord>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
