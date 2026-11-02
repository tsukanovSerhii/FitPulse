import type { Exercise } from '../model/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/shared/storage/localStorage'
import { INITIAL_EXERCISES } from './seed'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Built-in exercises always come from code so content updates reach every user;
// storage keeps only the ones the user created.
const isCustom = (exercise: Exercise) => exercise.id.startsWith('custom-')

function loadCustom(): Exercise[] {
  const stored = loadFromStorage<Exercise[]>(STORAGE_KEYS.EXERCISES, [])
  const custom = stored.filter(isCustom)
  if (custom.length !== stored.length) saveToStorage(STORAGE_KEYS.EXERCISES, custom)
  return custom
}

export const exercisesApi = {
  async getExercises(): Promise<Exercise[]> {
    await delay(250)
    return [...loadCustom(), ...INITIAL_EXERCISES]
  },

  async getFavorites(): Promise<string[]> {
    await delay(150)
    return loadFromStorage<string[]>(STORAGE_KEYS.EXERCISES_FAVORITES, ['ex-bench-press', 'ex-barbell-squat'])
  },

  async createExercise(exerciseData: Omit<Exercise, 'id'>): Promise<Exercise> {
    await delay(300)
    const newExercise: Exercise = { ...exerciseData, id: `custom-${Date.now()}` }
    saveToStorage(STORAGE_KEYS.EXERCISES, [newExercise, ...loadCustom()])
    return newExercise
  },

  async saveFavorites(favorites: string[]): Promise<string[]> {
    await delay(150)
    saveToStorage(STORAGE_KEYS.EXERCISES_FAVORITES, favorites)
    return favorites
  },
}
