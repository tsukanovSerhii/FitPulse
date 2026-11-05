import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { loadUserData, saveUserData } from '@/shared/storage/userStorage'
import type { BodyEntry } from '../model/types'

const sorted = (entries: BodyEntry[]) => [...entries].sort((a, b) => b.date.localeCompare(a.date))

export const bodyApi = {
  async getEntries(): Promise<BodyEntry[]> {
    return sorted(loadUserData<BodyEntry[]>(STORAGE_KEYS.BODY_LOG, []))
  },

  async addEntry(entry: Omit<BodyEntry, 'id'>): Promise<BodyEntry[]> {
    const created = { ...entry, id: `body-${Date.now()}` }
    const entries = sorted([created, ...loadUserData<BodyEntry[]>(STORAGE_KEYS.BODY_LOG, [])])
    saveUserData(STORAGE_KEYS.BODY_LOG, entries)
    return entries
  },

  async removeEntry(id: string): Promise<BodyEntry[]> {
    const entries = loadUserData<BodyEntry[]>(STORAGE_KEYS.BODY_LOG, []).filter((e) => e.id !== id)
    saveUserData(STORAGE_KEYS.BODY_LOG, entries)
    return sorted(entries)
  },
}
