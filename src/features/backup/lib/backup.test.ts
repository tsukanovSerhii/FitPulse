import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { loadUserData, saveUserData } from '@/shared/storage/userStorage'
import { BackupError, createBackup, historyToCsv, parseBackup, restoreBackup } from './backup'

const storage = installMemoryStorage({ signedIn: true })

const log = {
  id: 'l1',
  planName: 'Push; Pull',
  dayLabel: 'Понеділок',
  date: '2026-10-20T10:00:00.000Z',
  durationSeconds: 3000,
  totalSets: 8,
  totalReps: 64,
  totalVolumeKg: 4800,
  caloriesBurned: 300,
  exercises: [{ exerciseId: 'bench', exerciseName: 'Жим "штанги"', setsCompleted: 4, totalReps: 32, maxWeightKg: 75 }],
}

describe('backup', () => {
  beforeEach(() => storage.clear())

  it('round-trips the account data through a file', () => {
    saveUserData(STORAGE_KEYS.WORKOUT_HISTORY, [log])
    saveUserData(STORAGE_KEYS.ACTIVE_PLAN_ID, 'plan-1')
    const text = JSON.stringify(createBackup(new Date('2026-11-01')))

    storage.clear()
    restoreBackup(parseBackup(text))
    expect(loadUserData(STORAGE_KEYS.WORKOUT_HISTORY, [])).toEqual([log])
    expect(loadUserData(STORAGE_KEYS.ACTIVE_PLAN_ID, null)).toBe('plan-1')
  })

  it('rejects files that are not FitPulse backups', () => {
    expect(() => parseBackup('not json')).toThrow(BackupError)
    expect(() => parseBackup('{"app":"other","version":1,"data":{}}')).toThrow('не резервна')
    expect(() => parseBackup('{"app":"fitpulse","version":2,"data":{}}')).toThrow('версія')
    expect(() => parseBackup('{"app":"fitpulse","version":1,"data":{"history":{}}}')).toThrow('Журнал')
  })

  it('writes the journal as Excel-friendly CSV with escaped cells', () => {
    const csv = historyToCsv([log])
    expect(csv.startsWith('﻿Дата;Програма')).toBe(true)
    expect(csv).toContain('2026-10-20;"Push; Pull";Понеділок;"Жим ""штанги""";4;32;75;50;4800')
  })
})
