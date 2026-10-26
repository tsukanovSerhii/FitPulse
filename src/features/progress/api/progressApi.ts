import type { WorkoutHistoryLog, PersonalRecord } from '../model/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/services/storage/localStorage'
import { INITIAL_HISTORY, INITIAL_PRS } from '@/services/mockData/initialProgress'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const progressApi = {
  // Отримати всю історію та рекорди
  async getProgressData(): Promise<{ history: WorkoutHistoryLog[]; personalRecords: Record<string, PersonalRecord> }> {
    await delay(200)
    let history = loadFromStorage<WorkoutHistoryLog[]>(STORAGE_KEYS.WORKOUT_HISTORY, INITIAL_HISTORY)
    if (!history || history.length === 0) {
      history = INITIAL_HISTORY
      saveToStorage(STORAGE_KEYS.WORKOUT_HISTORY, INITIAL_HISTORY)
    }

    let prs = loadFromStorage<Record<string, PersonalRecord>>(STORAGE_KEYS.PERSONAL_RECORDS, INITIAL_PRS)
    if (!prs || Object.keys(prs).length === 0) {
      prs = INITIAL_PRS
      saveToStorage(STORAGE_KEYS.PERSONAL_RECORDS, INITIAL_PRS)
    }

    return { history, personalRecords: prs }
  },

  // Зберегти нове завершене тренування
  async saveWorkoutLog(log: WorkoutHistoryLog): Promise<WorkoutHistoryLog> {
    await delay(250)
    const history = loadFromStorage<WorkoutHistoryLog[]>(STORAGE_KEYS.WORKOUT_HISTORY, INITIAL_HISTORY)
    const updatedHistory = [log, ...history]
    saveToStorage(STORAGE_KEYS.WORKOUT_HISTORY, updatedHistory)

    // Перевірка та оновлення персональних рекордів (PRs)
    const prs = loadFromStorage<Record<string, PersonalRecord>>(STORAGE_KEYS.PERSONAL_RECORDS, INITIAL_PRS)
    const updatedPrs = { ...prs }

    for (const ex of log.exercises) {
      if (ex.maxWeightKg && ex.maxWeightKg > 0) {
        const existingPr = updatedPrs[ex.exerciseId]
        if (!existingPr || ex.maxWeightKg > existingPr.maxWeightKg) {
          updatedPrs[ex.exerciseId] = {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            maxWeightKg: ex.maxWeightKg,
            maxReps: ex.totalReps > 0 ? Math.round(ex.totalReps / (ex.setsCompleted || 1)) : 8,
            achievedAt: log.date,
          }
        }
      }
    }
    saveToStorage(STORAGE_KEYS.PERSONAL_RECORDS, updatedPrs)

    return log
  },

  // Видалити запис з історії
  async deleteWorkoutLog(logId: string): Promise<string> {
    await delay(200)
    const history = loadFromStorage<WorkoutHistoryLog[]>(STORAGE_KEYS.WORKOUT_HISTORY, INITIAL_HISTORY)
    const updated = history.filter((item) => item.id !== logId)
    saveToStorage(STORAGE_KEYS.WORKOUT_HISTORY, updated)
    return logId
  },
}
