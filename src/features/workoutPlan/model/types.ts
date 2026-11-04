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
  /** Exercises with the same group run as a superset: one set of each, then rest */
  group?: string
}

export interface WorkoutPlan {
  id: string
  name: string
  description?: string
  /** Set when the plan was added from the template library */
  templateId?: string
  createdAt: string
  updatedAt: string
  schedule: Record<DayOfWeek, PlanExercise[]>
}

export type TemplateExercise = Omit<PlanExercise, 'id' | 'order'>

export type PlanGoal = 'muscle' | 'strength' | 'fatLoss' | 'general'

export const PLAN_GOAL_LABELS: Record<PlanGoal, string> = {
  muscle: 'Маса',
  strength: 'Сила',
  fatLoss: 'Схуднення',
  general: 'Загальна форма',
}

export type PlanLevel = 'beginner' | 'intermediate' | 'advanced'

export const PLAN_LEVEL_LABELS: Record<PlanLevel, string> = {
  beginner: 'Новачок',
  intermediate: 'Середній',
  advanced: 'Просунутий',
}

export interface PlanTemplate {
  id: string
  name: string
  description: string
  goal: PlanGoal
  level: PlanLevel
  /** Typical session length */
  minutes: number
  schedule: Partial<Record<DayOfWeek, TemplateExercise[]>>
}

export interface WorkoutPlanState {
  plans: WorkoutPlan[]
  activePlanId: string | null
  editingDay: DayOfWeek | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
