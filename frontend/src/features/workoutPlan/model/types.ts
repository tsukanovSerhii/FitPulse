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
  /** Periodized plans: phases of the cycle and the week it started */
  cycle?: { startDate: string; phases: CyclePhase[] }
  /** A light week switched on by hand lasts until this moment */
  deloadUntil?: string
  createdAt: string
  updatedAt: string
  schedule: Record<DayOfWeek, PlanExercise[]>
}

export type TemplateExercise = Omit<PlanExercise, 'id' | 'order'>

/** One stage of a periodized cycle: its sets and reps replace the plan's for every exercise */
export interface CyclePhase {
  name: string
  weeks: number
  sets?: number
  reps?: number
  /** A light week: fewer sets, about 60 % of the usual weight */
  deload?: boolean
}

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
  /** Needs only what fits at home: dumbbells, a bench, a pull-up bar or nothing */
  home?: boolean
  /** Periodized program: the phases it runs through */
  cycle?: CyclePhase[]
}

export interface WorkoutPlanState {
  plans: WorkoutPlan[]
  activePlanId: string | null
  editingDay: DayOfWeek | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
