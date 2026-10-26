import type { WorkoutHistoryLog, PersonalRecord } from '../model/types'
import {
  hasStorageKey,
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from '@/services/storage/localStorage'
import { INITIAL_HISTORY, INITIAL_PRS } from '@/services/mockData/initialProgress'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Перерахунок персональних рекордів на основі повної актуальної історії тренувань.
 * Це гарантує цілісність аналітики при додаванні та видаленні тренувань.
 */
export function recalculatePersonalRecords(
  history: WorkoutHistoryLog[],
): Record<string, PersonalRecord> {
  const prs: Record<string, PersonalRecord> = {}

  // Сортуємо тренування хронологічно від найстаріших до найновіших
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
          // Повторний рекорд на тій же максимальній вазі
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
  // Отримати всю історію та рекорди
  async getProgressData(): Promise<{
    history: WorkoutHistoryLog[]
    personalRecords: Record<string, PersonalRecord>
  }> {
    await delay(100)
    let history: WorkoutHistoryLog[]

    // Перший запуск застосунку — ініціалізуємо демо-історією
    if (!hasStorageKey(STORAGE_KEYS.WORKOUT_HISTORY)) {
      history = INITIAL_HISTORY
      saveToStorage(STORAGE_KEYS.WORKOUT_HISTORY, INITIAL_HISTORY)
    } else {
      // Ключ існує — повертаємо збережені дані (навіть якщо це порожній масив [])
      history = loadFromStorage<WorkoutHistoryLog[]>(STORAGE_KEYS.WORKOUT_HISTORY, [])
    }

    let prs: Record<string, PersonalRecord>
    if (!hasStorageKey(STORAGE_KEYS.PERSONAL_RECORDS)) {
      prs = INITIAL_PRS
      saveToStorage(STORAGE_KEYS.PERSONAL_RECORDS, INITIAL_PRS)
    } else {
      prs = loadFromStorage<Record<string, PersonalRecord>>(STORAGE_KEYS.PERSONAL_RECORDS, {})
    }

    return { history, personalRecords: prs }
  },

  // Зберегти нове завершене тренування
  async saveWorkoutLog(log: WorkoutHistoryLog): Promise<{
    log: WorkoutHistoryLog
    personalRecords: Record<string, PersonalRecord>
  }> {
    await delay(100)
    const history = loadFromStorage<WorkoutHistoryLog[]>(STORAGE_KEYS.WORKOUT_HISTORY, [])
    const updatedHistory = [log, ...history]
    saveToStorage(STORAGE_KEYS.WORKOUT_HISTORY, updatedHistory)

    // Перераховуємо PRs на основі оновленої історії
    const updatedPrs = recalculatePersonalRecords(updatedHistory)
    saveToStorage(STORAGE_KEYS.PERSONAL_RECORDS, updatedPrs)

    return { log, personalRecords: updatedPrs }
  },

  // Видалити запис з історії та оновити рекорди
  async deleteWorkoutLog(logId: string): Promise<{
    deletedId: string
    personalRecords: Record<string, PersonalRecord>
  }> {
    await delay(100)
    const history = loadFromStorage<WorkoutHistoryLog[]>(STORAGE_KEYS.WORKOUT_HISTORY, [])
    const updatedHistory = history.filter((item) => item.id !== logId)
    saveToStorage(STORAGE_KEYS.WORKOUT_HISTORY, updatedHistory)

    // Перераховуємо рекорди за залишковою історією
    const updatedPrs = recalculatePersonalRecords(updatedHistory)
    saveToStorage(STORAGE_KEYS.PERSONAL_RECORDS, updatedPrs)

    return { deletedId: logId, personalRecords: updatedPrs }
  },
}
