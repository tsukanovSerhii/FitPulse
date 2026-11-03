import type { WorkoutHistoryLog, PersonalRecord } from '../model/types'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { hasUserData, loadUserData, saveUserData } from '@/shared/storage/userStorage'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Rebuilds personal records from the full history so edits and deletions stay consistent. */
export function recalculatePersonalRecords(
  history: WorkoutHistoryLog[],
): Record<string, PersonalRecord> {
  const prs: Record<string, PersonalRecord> = {}

  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  for (const log of sorted) {
    for (const ex of log.exercises) {
      if (ex.maxWeightKg && ex.maxWeightKg > 0) {
        const existing = prs[ex.exerciseId]
        const reps = ex.repsAtMaxWeight || (ex.totalReps > 0 ? Math.round(ex.totalReps / (ex.setsCompleted || 1)) : 1)

        if (!existing) {
          prs[ex.exerciseId] = {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            maxWeightKg: ex.maxWeightKg,
            maxReps: reps,
            achievedAt: log.date,
          }
        } else if (ex.maxWeightKg > existing.maxWeightKg) {
          prs[ex.exerciseId] = {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            maxWeightKg: ex.maxWeightKg,
            maxReps: reps,
            achievedAt: log.date,
          }
        } else if (ex.maxWeightKg === existing.maxWeightKg && reps > existing.maxReps) {
          prs[ex.exerciseId] = {
            ...existing,
            maxReps: reps,
            achievedAt: log.date,
          }
        }
      }
    }
  }

  return prs
}

export const progressApi = {
  async getProgressData(): Promise<{
    history: WorkoutHistoryLog[]
    personalRecords: Record<string, PersonalRecord>
  }> {
    await delay(100)
    let history: WorkoutHistoryLog[]

    // First run: seed demo history
    if (!hasUserData(STORAGE_KEYS.WORKOUT_HISTORY)) {
      history = (await import('./seed')).INITIAL_HISTORY
      saveUserData(STORAGE_KEYS.WORKOUT_HISTORY, history)
    } else {
      // Key exists: return stored data even if the user emptied it
      history = loadUserData<WorkoutHistoryLog[]>(STORAGE_KEYS.WORKOUT_HISTORY, [])
    }

    let prs: Record<string, PersonalRecord>
    if (!hasUserData(STORAGE_KEYS.PERSONAL_RECORDS)) {
      prs = (await import('./seed')).INITIAL_PRS
      saveUserData(STORAGE_KEYS.PERSONAL_RECORDS, prs)
    } else {
      prs = loadUserData<Record<string, PersonalRecord>>(STORAGE_KEYS.PERSONAL_RECORDS, {})
    }

    return { history, personalRecords: prs }
  },

  async saveWorkoutLog(log: WorkoutHistoryLog): Promise<{
    log: WorkoutHistoryLog
    personalRecords: Record<string, PersonalRecord>
  }> {
    await delay(100)
    const history = loadUserData<WorkoutHistoryLog[]>(STORAGE_KEYS.WORKOUT_HISTORY, [])
    const updatedHistory = [log, ...history]
    saveUserData(STORAGE_KEYS.WORKOUT_HISTORY, updatedHistory)

    const updatedPrs = recalculatePersonalRecords(updatedHistory)
    saveUserData(STORAGE_KEYS.PERSONAL_RECORDS, updatedPrs)

    return { log, personalRecords: updatedPrs }
  },

  async deleteWorkoutLog(logId: string): Promise<{
    deletedId: string
    personalRecords: Record<string, PersonalRecord>
  }> {
    await delay(100)
    const history = loadUserData<WorkoutHistoryLog[]>(STORAGE_KEYS.WORKOUT_HISTORY, [])
    const updatedHistory = history.filter((item) => item.id !== logId)
    saveUserData(STORAGE_KEYS.WORKOUT_HISTORY, updatedHistory)

    const updatedPrs = recalculatePersonalRecords(updatedHistory)
    saveUserData(STORAGE_KEYS.PERSONAL_RECORDS, updatedPrs)

    return { deletedId: logId, personalRecords: updatedPrs }
  },
}
