export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Понеділок',
  tuesday: 'Вівторок',
  wednesday: 'Середа',
  thursday: 'Четвер',
  friday: 'П\'ятниця',
  saturday: 'Субота',
  sunday: 'Неділя',
}

export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  monday: 'Пн',
  tuesday: 'Вт',
  wednesday: 'Ср',
  thursday: 'Чт',
  friday: 'Пт',
  saturday: 'Сб',
  sunday: 'Нд',
}

export const ALL_DAYS: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]

export interface PlanExercise {
  id: string
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
  weight?: number
  notes?: string
  order: number
}

export interface WorkoutPlan {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  schedule: Record<DayOfWeek, PlanExercise[]>
}

export interface WorkoutPlanState {
  plans: WorkoutPlan[]
  activePlanId: string | null
  editingDay: DayOfWeek | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
