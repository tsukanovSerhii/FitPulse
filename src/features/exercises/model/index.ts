export { default as exercisesReducer, addCustomExercise, clearSelectedExercise, fetchExercises, resetFilters, setFilter, saveExerciseNote, setMyEquipment, setMyLimits, setSelectedExercise, toggleFavorite } from './exercisesSlice'
export { DIFFICULTY_LABELS, EQUIPMENT_LABELS, JOINT_LABELS, MUSCLE_GROUP_LABELS, type Joint, type Equipment, type Exercise, type ExerciseFilters, type MuscleGroup } from './types'
export { alternativesFor, collapseVariants, searchText, variantsOf } from '../lib/variants'
