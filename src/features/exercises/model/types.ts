// Групи м'язів
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

// Рівень складності
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Новачок',
  intermediate: 'Середній',
  advanced: 'Просунутий',
}

// Тип обладнання
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

// Крок інструкції
export interface InstructionStep {
  step: number
  description: string
}

// Основна модель вправи
export interface Exercise {
  id: string
  name: string
  muscleGroups: MuscleGroup[]        // основна + додаткові групи
  primaryMuscle: MuscleGroup
  difficulty: Difficulty
  equipment: Equipment
  description: string
  instructions: InstructionStep[]
  tips: string[]
  defaultSets: number
  defaultReps: number
  defaultRestSeconds: number
  imageUrl?: string
  videoUrl?: string
  calories?: number                  // ккал/хв
}

// Фільтри
export interface ExerciseFilters {
  muscleGroup: MuscleGroup | 'all'
  difficulty: Difficulty | 'all'
  equipment: Equipment | 'all'
  searchQuery: string
}

// Стан слайсу
export interface ExercisesState {
  items: Exercise[]
  filteredItems: Exercise[]
  selectedExercise: Exercise | null
  filters: ExerciseFilters
  favorites: string[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
