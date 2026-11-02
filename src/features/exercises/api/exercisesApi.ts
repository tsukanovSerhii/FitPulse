import type { Exercise } from '../model/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/services/storage/localStorage'
import { INITIAL_EXERCISES } from '@/services/mockData/initialExercises'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const exercisesApi = {
  async getExercises(): Promise<Exercise[]> {
    await delay(250)
    const stored = loadFromStorage<Exercise[]>(STORAGE_KEYS.EXERCISES, INITIAL_EXERCISES)
    if (!stored || stored.length === 0) {
      saveToStorage(STORAGE_KEYS.EXERCISES, INITIAL_EXERCISES)
      return INITIAL_EXERCISES
    }
    return stored
  },

  async getFavorites(): Promise<string[]> {
    await delay(150)
    return loadFromStorage<string[]>(STORAGE_KEYS.EXERCISES_FAVORITES, ['ex-bench-press', 'ex-barbell-squat'])
  },

  async createExercise(exerciseData: Omit<Exercise, 'id'>): Promise<Exercise> {
    await delay(300)
    const newExercise: Exercise = {
      ...exerciseData,
      id: `custom-${Date.now()}`,
    }

    const current = loadFromStorage<Exercise[]>(STORAGE_KEYS.EXERCISES, INITIAL_EXERCISES)
    const updated = [newExercise, ...current]
    saveToStorage(STORAGE_KEYS.EXERCISES, updated)
    return newExercise
  },

  async saveFavorites(favorites: string[]): Promise<string[]> {
    await delay(150)
    saveToStorage(STORAGE_KEYS.EXERCISES_FAVORITES, favorites)
    return favorites
  },
}
