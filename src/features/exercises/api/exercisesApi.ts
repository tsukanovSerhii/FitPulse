import type { Exercise } from '../model/types'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { loadUserData, saveUserData } from '@/shared/storage/userStorage'
import { INITIAL_EXERCISES } from './seed'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Built-in exercises always come from code so content updates reach every user;
// storage keeps only the ones the user created.
const isCustom = (exercise: Exercise) => exercise.id.startsWith('custom-')

function loadCustom(): Exercise[] {
  const stored = loadUserData<Exercise[]>(STORAGE_KEYS.EXERCISES, [])
  const custom = stored.filter(isCustom)
  if (custom.length !== stored.length) saveUserData(STORAGE_KEYS.EXERCISES, custom)
  return custom
}

export const exercisesApi = {
  async getExercises(): Promise<Exercise[]> {
    await delay(250)
    return [...loadCustom(), ...INITIAL_EXERCISES]
  },

  async getFavorites(): Promise<string[]> {
    await delay(150)
    return loadUserData<string[]>(STORAGE_KEYS.EXERCISES_FAVORITES, ['ex-bench-press', 'ex-barbell-squat'])
  },

  async createExercise(exerciseData: Omit<Exercise, 'id'>): Promise<Exercise> {
    await delay(300)
    const newExercise: Exercise = { ...exerciseData, id: `custom-${Date.now()}` }
    saveUserData(STORAGE_KEYS.EXERCISES, [newExercise, ...loadCustom()])
    return newExercise
  },

  async saveFavorites(favorites: string[]): Promise<string[]> {
    await delay(150)
    saveUserData(STORAGE_KEYS.EXERCISES_FAVORITES, favorites)
    return favorites
  },
}
