import type { SyncChange, SyncKind } from '@fitpulse/contracts'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { hasUserData, loadUserData, removeUserData, saveUserData, type UserKey } from '@/shared/storage/userStorage'

// Per-user storage keys that hold a list of records with ids
const RECORD_KEYS = {
  workout: STORAGE_KEYS.WORKOUT_HISTORY,
  body: STORAGE_KEYS.BODY_LOG,
  plan: STORAGE_KEYS.WORKOUT_PLANS,
  exercise: STORAGE_KEYS.EXERCISES,
} as const satisfies Partial<Record<SyncKind, UserKey>>

type RecordKind = keyof typeof RECORD_KEYS

// Settings sync as whole values; their id is the storage key
export const SETTING_KEYS: UserKey[] = [
  STORAGE_KEYS.USER_PROFILE,
  STORAGE_KEYS.WEEKLY_GOAL,
  STORAGE_KEYS.MY_EQUIPMENT,
  STORAGE_KEYS.MY_LIMITS,
  STORAGE_KEYS.ACTIVE_PLAN_ID,
  STORAGE_KEYS.EXERCISES_FAVORITES,
  STORAGE_KEYS.EXERCISE_NOTES,
]

export interface LocalRecord {
  kind: SyncKind
  id: string
  data: unknown
}

/** Hashes of what the server already has, by recordKey. */
export type Hashes = Record<string, string>

export const recordKey = (kind: string, id: string) => `${kind}:${id}`

/** A storage key holds something that is not valid data; syncing it would delete its records everywhere. */
export class UnreadableStorageError extends Error {
  constructor(key: string) {
    super(`Unreadable local data in ${key}`)
    this.name = 'UnreadableStorageError'
  }
}

const UNREADABLE = Symbol('unreadable')

function readStrict<T>(key: UserKey): T | undefined {
  if (!hasUserData(key)) return undefined
  const value = loadUserData<T | typeof UNREADABLE>(key, UNREADABLE)
  if (value === UNREADABLE) throw new UnreadableStorageError(key)
  return value
}

/** FNV-1a, 32 bit: cheap change detection without keeping a second copy of the data. */
export function hashOf(value: unknown): string {
  const text = JSON.stringify(value) ?? 'undefined'
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16)
}

/** Everything of the signed-in account that syncs, as it is on this device now. */
export function collectRecords(): Map<string, LocalRecord> {
  const records = new Map<string, LocalRecord>()
  for (const [kind, storageKey] of Object.entries(RECORD_KEYS) as [RecordKind, UserKey][]) {
    const list = readStrict<{ id?: unknown }[]>(storageKey) ?? []
    if (!Array.isArray(list)) throw new UnreadableStorageError(storageKey)
    for (const item of list) {
      if (typeof item?.id === 'string') records.set(recordKey(kind, item.id), { kind, id: item.id, data: item })
    }
  }
  for (const storageKey of SETTING_KEYS) {
    // A setting never saved on this device has nothing to share yet
    const value = readStrict<unknown>(storageKey)
    if (value !== undefined) records.set(recordKey('setting', storageKey), { kind: 'setting', id: storageKey, data: value })
  }
  return records
}

/** Changes noticed but not yet confirmed by the server, with the time they were first noticed. */
export type Pending = Record<string, { hash: string; at: string }>

const DELETED = 'deleted'

/**
 * New and changed records since the last sync, plus deletions of records that disappeared. A change
 * already noticed earlier (say, while offline) keeps that time, so last-write-wins compares when
 * edits were made, not when they reached the server.
 */
export function diffChanges(records: Map<string, LocalRecord>, hashes: Hashes, now: Date, pending: Pending = {}): SyncChange[] {
  const stamp = (key: string, hash: string) => (pending[key]?.hash === hash ? pending[key].at : now.toISOString())
  const changes: SyncChange[] = []
  for (const [key, record] of records) {
    const hash = hashOf(record.data)
    if (hashes[key] !== hash) changes.push({ kind: record.kind, id: record.id, data: record.data, updatedAt: stamp(key, hash) })
  }
  for (const key of Object.keys(hashes)) {
    if (records.has(key)) continue
    const separator = key.indexOf(':')
    changes.push({ kind: key.slice(0, separator) as SyncKind, id: key.slice(separator + 1), data: null, updatedAt: stamp(key, DELETED) })
  }
  return changes
}

export function pendingFor(changes: SyncChange[]): Pending {
  return Object.fromEntries(changes.map((c) => [recordKey(c.kind, c.id), { hash: c.data === null ? DELETED : hashOf(c.data), at: c.updatedAt }]))
}

/** Hashes after these changes are known to the server: sent ones and received ones alike. */
export function rememberHashes(hashes: Hashes, changes: Pick<SyncChange, 'kind' | 'id' | 'data'>[]): Hashes {
  const next = { ...hashes }
  for (const change of changes) {
    const key = recordKey(change.kind, change.id)
    if (change.data === null) delete next[key]
    else next[key] = hashOf(change.data)
  }
  return next
}

const byDateDesc = (a: { date?: string }, b: { date?: string }) => (b.date ?? '').localeCompare(a.date ?? '')

/** Writes changes from the server into storage; returns the kinds that changed. */
export function applyChanges(changes: SyncChange[]): Set<SyncKind> {
  const touched = new Set<SyncKind>()
  const lists = new Map<RecordKind, Map<string, unknown>>()

  for (const change of changes) {
    touched.add(change.kind)
    if (change.kind === 'setting') {
      if (!SETTING_KEYS.includes(change.id as UserKey)) continue
      if (change.data === null) removeUserData(change.id as UserKey)
      else saveUserData(change.id as UserKey, change.data)
      continue
    }
    const kind = change.kind as RecordKind
    if (!lists.has(kind)) {
      const current = loadUserData<{ id: string }[]>(RECORD_KEYS[kind], [])
      lists.set(kind, new Map(current.map((item) => [item.id, item])))
    }
    const list = lists.get(kind)!
    if (change.data === null) list.delete(change.id)
    else list.set(change.id, change.data)
  }

  for (const [kind, list] of lists) {
    const items = [...list.values()] as { date?: string }[]
    // The journal and the body log are read newest first
    saveUserData(RECORD_KEYS[kind], kind === 'workout' || kind === 'body' ? items.sort(byDateDesc) : items)
  }
  // Records are derived from the journal and recalculated on the next load
  if (touched.has('workout')) removeUserData(STORAGE_KEYS.PERSONAL_RECORDS)
  return touched
}
