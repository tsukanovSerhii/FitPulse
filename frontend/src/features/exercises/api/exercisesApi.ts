import type { Equipment, Exercise, Joint } from '../model/types'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { loadUserData, saveUserData } from '@/shared/storage/userStorage'
import { communityApi } from './communityApi'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Built-in exercises always come from code so content updates reach every user;
// storage keeps only the ones the user created.
const isCustom = (exercise: Exercise) => exercise.id.startsWith('custom-')

// A sleeping server must not hold the whole catalog back
const COMMUNITY_WAIT_MS = 3000

/** Approved exercises of other users; offline or slow, the last list the server sent. */
async function loadCommunity(): Promise<Exercise[]> {
  const fresh = communityApi.list().then((items) => {
    saveUserData(STORAGE_KEYS.COMMUNITY_EXERCISES, items)
    return items
  })
  const late = new Promise<null>((resolve) => setTimeout(() => resolve(null), COMMUNITY_WAIT_MS))
  const items = await Promise.race([fresh, late]).catch(() => null)
  return items ?? loadUserData<Exercise[]>(STORAGE_KEYS.COMMUNITY_EXERCISES, [])
}

function loadCustom(): Exercise[] {
  const stored = loadUserData<Exercise[]>(STORAGE_KEYS.EXERCISES, [])
  const custom = stored.filter(isCustom)
  if (custom.length !== stored.length) saveUserData(STORAGE_KEYS.EXERCISES, custom)
  return custom
}

export const exercisesApi = {
  async getExercises(): Promise<Exercise[]> {
    // The catalog is the largest piece of data, so it stays out of the entry bundle
    const [{ INITIAL_EXERCISES }, community] = await Promise.all([import('./seed'), loadCommunity()])
    return [...loadCustom(), ...community, ...INITIAL_EXERCISES]
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

  /** Equipment the user has in their gym; empty means any */
  async getMyEquipment(): Promise<Equipment[]> {
    return loadUserData<Equipment[]>(STORAGE_KEYS.MY_EQUIPMENT, [])
  },

  /** Joints the user protects */
  async getMyLimits(): Promise<Joint[]> {
    return loadUserData<Joint[]>(STORAGE_KEYS.MY_LIMITS, [])
  },

  async saveMyLimits(limits: Joint[]): Promise<Joint[]> {
    saveUserData(STORAGE_KEYS.MY_LIMITS, limits)
    return limits
  },

  async saveMyEquipment(equipment: Equipment[]): Promise<Equipment[]> {
    saveUserData(STORAGE_KEYS.MY_EQUIPMENT, equipment)
    return equipment
  },

  /** The user's own notes per exercise: seat position, grip, anything to remember */
  async getNotes(): Promise<Record<string, string>> {
    return loadUserData<Record<string, string>>(STORAGE_KEYS.EXERCISE_NOTES, {})
  },

  async saveNote(exerciseId: string, text: string): Promise<Record<string, string>> {
    const notes = { ...loadUserData<Record<string, string>>(STORAGE_KEYS.EXERCISE_NOTES, {}) }
    if (text.trim()) notes[exerciseId] = text.trim()
    else delete notes[exerciseId]
    saveUserData(STORAGE_KEYS.EXERCISE_NOTES, notes)
    return notes
  },

  async saveFavorites(favorites: string[]): Promise<string[]> {
    await delay(150)
    saveUserData(STORAGE_KEYS.EXERCISES_FAVORITES, favorites)
    return favorites
  },
}
