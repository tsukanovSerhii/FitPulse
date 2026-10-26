import type { UserProfile } from '../model/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/services/storage/localStorage'
import { INITIAL_PROFILE } from '@/services/mockData/initialProfile'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const profileApi = {
  // Отримати профіль користувача
  async getProfile(): Promise<UserProfile> {
    await delay(200)
    let profile = loadFromStorage<UserProfile>(STORAGE_KEYS.USER_PROFILE, INITIAL_PROFILE)
    if (!profile) {
      profile = INITIAL_PROFILE
      saveToStorage(STORAGE_KEYS.USER_PROFILE, INITIAL_PROFILE)
    }
    return profile
  },

  // Оновити профіль користувача
  async updateProfile(updated: UserProfile): Promise<UserProfile> {
    await delay(250)
    saveToStorage(STORAGE_KEYS.USER_PROFILE, updated)
    return updated
  },

  // Скинути дані профілю
  async resetProfile(): Promise<UserProfile> {
    await delay(200)
    saveToStorage(STORAGE_KEYS.USER_PROFILE, INITIAL_PROFILE)
    return INITIAL_PROFILE
  },
}
