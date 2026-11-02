export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'cardio'
  | 'glutes'
  | 'calves'

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Груди',
  back: 'Спина',
  legs: 'Ноги',
  shoulders: 'Плечі',
  biceps: 'Біцепс',
  triceps: 'Трицепс',
  abs: 'Прес',
  cardio: 'Кардіо',
  glutes: 'Сідниці',
  calves: 'Гомілки',
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Новачок',
  intermediate: 'Середній',
  advanced: 'Просунутий',
}

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'bodyweight'
  | 'cables'
  | 'kettlebell'
  | 'bands'

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Штанга',
  dumbbell: 'Гантелі',
  machine: 'Тренажер',
  bodyweight: 'Без обладнання',
  cables: 'Блоки',
  kettlebell: 'Гиря',
  bands: 'Гумки',
}

export interface InstructionStep {
  step: number
  description: string
}

export interface MovementPhase {
  name: string
  instruction: string
  cue: string
  breathing: 'inhale' | 'exhale' | 'hold'
}

export interface ExerciseGuide {
  tempo?: string
  breathingAdvice?: string
  phases?: MovementPhase[]
  commonMistakes?: string[]
  beginnerTips?: string[]
  proTips?: string[]
}

export interface TechniqueStep {
  title: string
  text: string
  /** Which of the two photos shows this moment */
  frame: 0 | 1
  /** Duration in the demo loop; the photo cross-fades for this long */
  seconds: number
  breathing?: 'inhale' | 'exhale' | 'hold'
}

export interface ExerciseTechnique {
  steps: TechniqueStep[]
  cues: string[]
  mistakes: string[]
  advanced?: string[]
}

export interface Exercise {
  id: string
  name: string
  muscleGroups: MuscleGroup[]
  primaryMuscle: MuscleGroup
  difficulty: Difficulty
  equipment: Equipment
  description: string
  /** Legacy step list, still produced by custom exercises */
  instructions?: InstructionStep[]
  tips?: string[]
  defaultSets: number
  defaultReps: number
  defaultRestSeconds: number
  /** Start and end photos of the movement */
  frames?: [string, string]
  animationFrames?: string[]
  calories?: number
  technique?: ExerciseTechnique
  /** Legacy shape, still produced by custom exercises */
  guide?: ExerciseGuide
}

export interface ExerciseFilters {
  muscleGroup: MuscleGroup | 'all'
  difficulty: Difficulty | 'all'
  equipment: Equipment | 'all'
  searchQuery: string
}

export interface ExercisesState {
  items: Exercise[]
  filteredItems: Exercise[]
  selectedExercise: Exercise | null
  filters: ExerciseFilters
  favorites: string[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
