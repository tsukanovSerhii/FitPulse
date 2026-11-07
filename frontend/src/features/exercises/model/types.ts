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
  | 'ezbar'
  | 'dumbbell'
  | 'kettlebell'
  | 'smith'
  | 'machine'
  | 'cables'
  | 'crossover'
  | 'bodyweight'
  | 'bands'

/** Key order is the order of the equipment filter */
export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Штанга',
  ezbar: 'EZ-гриф',
  dumbbell: 'Гантелі',
  kettlebell: 'Гиря',
  smith: 'Сміт',
  machine: 'Тренажер',
  cables: 'Блок',
  crossover: 'Кросовер',
  bodyweight: 'Без обладнання',
  bands: 'Гумки',
}

export type Joint = 'knees' | 'back' | 'shoulders'

export const JOINT_LABELS: Record<Joint, string> = {
  knees: 'Коліна',
  back: 'Поперек',
  shoulders: 'Плечі',
}

export interface InstructionStep {
  step: number
  description: string
}

export interface ExerciseGuide {
  commonMistakes?: string[]
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
  calories?: number
  technique?: ExerciseTechnique
  /** Legacy shape, still produced by custom exercises */
  guide?: ExerciseGuide
  /** Membership in a group of variants of one movement, e.g. bench press with a barbell or dumbbells */
  variant?: ExerciseVariant
  /** Other names to search by: slang, Russian, English */
  aliases?: string
  /** Joints the exercise loads noticeably */
  stress?: Joint[]
  /** Set on exercises other users shared: the name shown as their author */
  authorName?: string
}

export interface ExerciseVariant {
  group: string
  groupName: string
  /** Short name of this variant within the group: "Штанга", "Сміт" */
  label: string
  /** Position within the group */
  order: number
}

export interface ExerciseFilters {
  muscleGroup: MuscleGroup | 'all'
  difficulty: Difficulty | 'all'
  /** Equipment the user has; empty means any */
  equipment: Equipment[]
  /** Joints the user protects: exercises that load them are hidden */
  limits: Joint[]
  searchQuery: string
}

export interface ExercisesState {
  items: Exercise[]
  filteredItems: Exercise[]
  selectedExercise: Exercise | null
  filters: ExerciseFilters
  favorites: string[]
  /** The user's notes per exercise id */
  notes: Record<string, string>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
