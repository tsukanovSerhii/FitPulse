import type { SyncChange, SyncResponse } from '@fitpulse/contracts'
import { ApiError, apiRequest, NetworkError, withLock } from '@/shared/api/http'
import { loadFromStorage, saveToStorage } from '@/shared/storage/localStorage'
import { currentUserId } from '@/shared/storage/userStorage'
import { applyChanges, collectRecords, diffChanges, pendingFor, rememberHashes, UnreadableStorageError, type Hashes, type Pending } from '../lib/engine'

interface SyncState {
  cursor: string
  hashes: Hashes
  pending?: Pending
}

export type SyncOutcome =
  | { status: 'synced'; received: boolean }
  | { status: 'offline' | 'error' | 'signedOut' }
  /** Most of the synced records vanished at once; sent only after the user confirms */
  | { status: 'confirmDelete'; count: number }

class MassDeletion extends Error {
  readonly count: number
  constructor(count: number) {
    super('mass deletion')
    this.count = count
  }
}

const stateKey = (userId: string) => `fitpulse_sync_v1:${userId}`
const MAX_ROUNDS = 50
// SYNC_LIMITS.changes in @fitpulse/contracts; a value import there would pull Zod into the entry bundle
const MAX_CHANGES = 500
// More deletions than this, and more than half of what was synced, wait for a confirmation
const MASS_DELETE = 20

async function exchange(userId: string, allowMassDelete: boolean): Promise<boolean> {
  let state = loadFromStorage<SyncState>(stateKey(userId), { cursor: '0', hashes: {} })
  const pending = diffChanges(collectRecords(), state.hashes, new Date(), state.pending)
  const deletions = pending.filter((c) => c.data === null).length
  if (!allowMassDelete && deletions > MASS_DELETE && deletions > Object.keys(state.hashes).length / 2) throw new MassDeletion(deletions)
  // Remembered before the network, so an offline attempt keeps the edit times for the next one
  state = { ...state, pending: pendingFor(pending) }
  saveToStorage(stateKey(userId), state)
  let received = false

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const sent: SyncChange[] = pending.splice(0, MAX_CHANGES)
    const res = await apiRequest<SyncResponse>('/api/sync', { method: 'POST', body: { cursor: state.cursor, changes: sent }, auth: true })
    if (res.changes.length > 0) {
      applyChanges(res.changes)
      received = true
    }
    // Sent first, received second: a version the server kept instead of ours wins locally too
    const stillPending = { ...state.pending }
    for (const change of sent) delete stillPending[`${change.kind}:${change.id}`]
    state = { cursor: res.cursor, hashes: rememberHashes(rememberHashes(state.hashes, sent), res.changes), pending: stillPending }
    saveToStorage(stateKey(userId), state)
    if (pending.length === 0 && !res.hasMore) break
  }
  return received
}

let running: Promise<SyncOutcome> | null = null

/** One exchange with the server; tabs take turns, calls in the same tab share the run. */
export function syncNow({ allowMassDelete = false } = {}): Promise<SyncOutcome> {
  running ??= (async (): Promise<SyncOutcome> => {
    const userId = currentUserId()
    if (!userId) return { status: 'signedOut' }
    try {
      // Its own lock: a token refresh during the exchange takes the refresh lock and must not wait on this one
      const received = await withLock('fitpulse-sync', () => exchange(userId, allowMassDelete))
      return { status: 'synced', received }
    } catch (error) {
      if (error instanceof NetworkError) return { status: 'offline' }
      if (error instanceof MassDeletion) return { status: 'confirmDelete', count: error.count }
      if (error instanceof UnreadableStorageError) console.error('[sync]', error.message)
      if (error instanceof ApiError && error.status === 401) return { status: 'signedOut' }
      return { status: 'error' }
    }
  })().finally(() => {
    running = null
  })
  return running
}
