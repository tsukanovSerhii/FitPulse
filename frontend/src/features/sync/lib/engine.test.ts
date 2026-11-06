import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { applyChanges, collectRecords, diffChanges, hashOf, recordKey, rememberHashes } from './engine'

const storage = installMemoryStorage({ signedIn: true })
const put = (key: string, value: unknown) => storage.local.set(storage.userKey(key), JSON.stringify(value))
const read = (key: string) => JSON.parse(storage.local.get(storage.userKey(key)) ?? 'null')
const NOW = new Date('2026-11-07T12:00:00.000Z')

beforeEach(() => storage.clear())

describe('collecting and diffing', () => {
  it('collects records by kind and settings that exist on the device', () => {
    put(STORAGE_KEYS.WORKOUT_HISTORY, [{ id: 'w1', date: '2026-11-01' }])
    put(STORAGE_KEYS.WORKOUT_PLANS, [{ id: 'p1', name: 'A' }])
    put(STORAGE_KEYS.WEEKLY_GOAL, 4)
    const records = collectRecords()
    expect([...records.keys()].sort()).toEqual([
      recordKey('plan', 'p1'),
      recordKey('setting', STORAGE_KEYS.WEEKLY_GOAL),
      recordKey('workout', 'w1'),
    ].sort())
  })

  it('gives new, changed and removed records, and nothing for unchanged ones', () => {
    put(STORAGE_KEYS.WORKOUT_HISTORY, [{ id: 'w1', v: 1 }, { id: 'w2', v: 2 }])
    const first = collectRecords()
    const hashes = rememberHashes({}, [...first.values()].map((r) => ({ ...r, updatedAt: NOW.toISOString() })))
    expect(diffChanges(collectRecords(), hashes, NOW)).toEqual([])

    put(STORAGE_KEYS.WORKOUT_HISTORY, [{ id: 'w1', v: 10 }, { id: 'w3', v: 3 }])
    const changes = diffChanges(collectRecords(), hashes, NOW)
    expect(changes).toEqual(
      expect.arrayContaining([
        { kind: 'workout', id: 'w1', data: { id: 'w1', v: 10 }, updatedAt: NOW.toISOString() },
        { kind: 'workout', id: 'w3', data: { id: 'w3', v: 3 }, updatedAt: NOW.toISOString() },
        { kind: 'workout', id: 'w2', data: null, updatedAt: NOW.toISOString() },
      ]),
    )
    expect(changes).toHaveLength(3)
  })

  it('hashes are stable for the same value', () => {
    expect(hashOf({ a: 1, b: [2] })).toBe(hashOf({ a: 1, b: [2] }))
    expect(hashOf({ a: 1 })).not.toBe(hashOf({ a: 2 }))
  })
})

describe('applying received changes', () => {
  it('inserts, replaces and deletes records and settings', () => {
    put(STORAGE_KEYS.BODY_LOG, [{ id: 'b1', weightKg: 70 }, { id: 'b2', weightKg: 71 }])
    put(STORAGE_KEYS.MY_LIMITS, ['knees'])
    const touched = applyChanges([
      { kind: 'body', id: 'b1', data: { id: 'b1', weightKg: 69 }, updatedAt: NOW.toISOString() },
      { kind: 'body', id: 'b2', data: null, updatedAt: NOW.toISOString() },
      { kind: 'body', id: 'b3', data: { id: 'b3', weightKg: 68 }, updatedAt: NOW.toISOString() },
      { kind: 'setting', id: STORAGE_KEYS.WEEKLY_GOAL, data: 5, updatedAt: NOW.toISOString() },
      { kind: 'setting', id: STORAGE_KEYS.MY_LIMITS, data: null, updatedAt: NOW.toISOString() },
    ])
    expect(read(STORAGE_KEYS.BODY_LOG)).toEqual(expect.arrayContaining([{ id: 'b1', weightKg: 69 }, { id: 'b3', weightKg: 68 }]))
    expect(read(STORAGE_KEYS.BODY_LOG)).toHaveLength(2)
    expect(read(STORAGE_KEYS.WEEKLY_GOAL)).toBe(5)
    expect(read(STORAGE_KEYS.MY_LIMITS)).toBeNull()
    expect([...touched].sort()).toEqual(['body', 'setting'])
  })

  it('received workouts reset the records so they are recalculated from the journal', () => {
    put(STORAGE_KEYS.PERSONAL_RECORDS, { 'ex-bench-press': { maxWeightKg: 100 } })
    put(STORAGE_KEYS.WORKOUT_HISTORY, [{ id: 'w1', date: '2026-11-01T10:00:00.000Z' }])
    applyChanges([{ kind: 'workout', id: 'w2', data: { id: 'w2', date: '2026-11-05T10:00:00.000Z' }, updatedAt: NOW.toISOString() }])
    expect(read(STORAGE_KEYS.PERSONAL_RECORDS)).toBeNull()
    expect(read(STORAGE_KEYS.WORKOUT_HISTORY).map((w: { id: string }) => w.id)).toEqual(['w2', 'w1'])
  })

  it('first sign-in on a device merges: local records stay and server ones are added', () => {
    put(STORAGE_KEYS.WORKOUT_HISTORY, [{ id: 'local', date: '2026-11-02T10:00:00.000Z' }])
    const local = diffChanges(collectRecords(), {}, NOW)
    expect(local).toHaveLength(1)
    applyChanges([{ kind: 'workout', id: 'server', data: { id: 'server', date: '2026-11-03T10:00:00.000Z' }, updatedAt: NOW.toISOString() }])
    expect(read(STORAGE_KEYS.WORKOUT_HISTORY).map((w: { id: string }) => w.id).sort()).toEqual(['local', 'server'])
  })
})
