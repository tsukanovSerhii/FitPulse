import type { UserProfile } from '../model/types'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { loadUserData, saveUserData } from '@/shared/storage/userStorage'
import { INITIAL_PROFILE } from './seed'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const profileApi = {
  async getProfile(): Promise<UserProfile> {
    await delay(200)
    let profile = loadUserData<UserProfile>(STORAGE_KEYS.USER_PROFILE, INITIAL_PROFILE)
    if (!profile) {
      profile = INITIAL_PROFILE
      saveUserData(STORAGE_KEYS.USER_PROFILE, INITIAL_PROFILE)
    }
    return profile
  },

  async updateProfile(updated: UserProfile): Promise<UserProfile> {
    await delay(250)
    saveUserData(STORAGE_KEYS.USER_PROFILE, updated)
    return updated
  },

  async resetProfile(): Promise<UserProfile> {
    await delay(200)
    saveUserData(STORAGE_KEYS.USER_PROFILE, INITIAL_PROFILE)
    return INITIAL_PROFILE
  },
}
