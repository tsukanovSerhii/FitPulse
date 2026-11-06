import type { SyncChange, SyncResponse } from '@fitpulse/contracts'
import { ApiError, apiRequest, NetworkError, withLock } from '@/shared/api/http'
import { loadFromStorage, saveToStorage } from '@/shared/storage/localStorage'
import { currentUserId } from '@/shared/storage/userStorage'
import { applyChanges, collectRecords, diffChanges, rememberHashes, type Hashes } from '../lib/engine'

interface SyncState {
  cursor: string
  hashes: Hashes
}

export type SyncOutcome = { status: 'synced'; received: boolean } | { status: 'offline' | 'error' | 'signedOut' }

const stateKey = (userId: string) => `fitpulse_sync_v1:${userId}`
const MAX_ROUNDS = 50
// SYNC_LIMITS.changes in @fitpulse/contracts; a value import there would pull Zod into the entry bundle
const MAX_CHANGES = 500

async function exchange(userId: string): Promise<boolean> {
  let state = loadFromStorage<SyncState>(stateKey(userId), { cursor: '0', hashes: {} })
  const pending = diffChanges(collectRecords(), state.hashes, new Date())
  let received = false

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const sent: SyncChange[] = pending.splice(0, MAX_CHANGES)
    const res = await apiRequest<SyncResponse>('/api/sync', { method: 'POST', body: { cursor: state.cursor, changes: sent }, auth: true })
    if (res.changes.length > 0) {
      applyChanges(res.changes)
      received = true
    }
    // Sent first, received second: a version the server kept instead of ours wins locally too
    state = { cursor: res.cursor, hashes: rememberHashes(rememberHashes(state.hashes, sent), res.changes) }
    saveToStorage(stateKey(userId), state)
    if (pending.length === 0 && !res.hasMore) break
  }
  return received
}

let running: Promise<SyncOutcome> | null = null

/** One exchange with the server; tabs take turns, calls in the same tab share the run. */
export function syncNow(): Promise<SyncOutcome> {
  running ??= (async (): Promise<SyncOutcome> => {
    const userId = currentUserId()
    if (!userId) return { status: 'signedOut' }
    try {
      // Its own lock: a token refresh during the exchange takes the refresh lock and must not wait on this one
      const received = await withLock('fitpulse-sync', () => exchange(userId))
      return { status: 'synced', received }
    } catch (error) {
      if (error instanceof NetworkError) return { status: 'offline' }
      if (error instanceof ApiError && error.status === 401) return { status: 'signedOut' }
      return { status: 'error' }
    }
  })().finally(() => {
    running = null
  })
  return running
}
