import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { loadUserData, saveUserData, type UserKey } from '@/shared/storage/userStorage'
import type { WorkoutHistoryLog } from '@/features/progress/model'

/** What a backup file contains, keyed by a stable name rather than the storage key. */
const SECTIONS = {
  history: STORAGE_KEYS.WORKOUT_HISTORY,
  records: STORAGE_KEYS.PERSONAL_RECORDS,
  plans: STORAGE_KEYS.WORKOUT_PLANS,
  activePlanId: STORAGE_KEYS.ACTIVE_PLAN_ID,
  profile: STORAGE_KEYS.USER_PROFILE,
  customExercises: STORAGE_KEYS.EXERCISES,
  favorites: STORAGE_KEYS.EXERCISES_FAVORITES,
} satisfies Record<string, UserKey>

type Section = keyof typeof SECTIONS

export interface Backup {
  app: 'fitpulse'
  version: 1
  exportedAt: string
  data: Partial<Record<Section, unknown>>
}

export class BackupError extends Error {}

export function createBackup(now = new Date()): Backup {
  const data: Backup['data'] = {}
  for (const [section, key] of Object.entries(SECTIONS) as [Section, UserKey][]) {
    const value = loadUserData<unknown>(key, undefined)
    if (value !== undefined) data[section] = value
  }
  return { app: 'fitpulse', version: 1, exportedAt: now.toISOString(), data }
}

/** Parses and checks a backup file; throws a readable BackupError when it is not one. */
export function parseBackup(text: string): Backup {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new BackupError('Файл не є JSON')
  }
  const backup = parsed as Partial<Backup> | null
  if (!backup || backup.app !== 'fitpulse' || typeof backup.data !== 'object' || backup.data === null) {
    throw new BackupError('Це не резервна копія FitPulse')
  }
  if (backup.version !== 1) throw new BackupError('Непідтримувана версія резервної копії')
  if (backup.data.history !== undefined && !Array.isArray(backup.data.history)) throw new BackupError('Журнал у файлі пошкоджений')
  if (backup.data.plans !== undefined && !Array.isArray(backup.data.plans)) throw new BackupError('Програми у файлі пошкоджені')
  return backup as Backup
}

export function restoreBackup(backup: Backup) {
  for (const [section, key] of Object.entries(SECTIONS) as [Section, UserKey][]) {
    if (section in backup.data) saveUserData(key, backup.data[section])
  }
}

const csvCell = (value: string | number | undefined | null) => {
  const text = value === undefined || value === null ? '' : String(value)
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Journal as CSV, one row per exercise in a session. Semicolons and a BOM suit Excel with a Ukrainian locale. */
export function historyToCsv(history: WorkoutHistoryLog[]): string {
  const header = ['Дата', 'Програма', 'День', 'Вправа', 'Підходи', 'Повтори', 'Макс. вага, кг', 'Тривалість, хв', 'Тоннаж тренування, кг']
  const rows = [...history]
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((log) => {
      const base = [log.date.slice(0, 10), log.planName, log.dayLabel ?? '']
      const tail = [Math.round(log.durationSeconds / 60), log.totalVolumeKg]
      return log.exercises.length
        ? log.exercises.map((e) => [...base, e.exerciseName, e.setsCompleted, e.totalReps, e.maxWeightKg ?? '', ...tail])
        : [[...base, '', log.totalSets, log.totalReps, '', ...tail]]
    })
  return '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
}
