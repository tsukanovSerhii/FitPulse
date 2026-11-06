import type { SyncState } from '../model/syncSlice'

const time = new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' })

export function syncStatusText({ status, lastSyncedAt }: Pick<SyncState, 'status' | 'lastSyncedAt'>, now = new Date()): string {
  if (status === 'offline') return 'Очікує мережі'
  if (status === 'error') return 'Помилка синхронізації'
  if (!lastSyncedAt) return status === 'syncing' ? 'Синхронізуємо…' : 'Ще не синхронізовано'
  const at = new Date(lastSyncedAt)
  return now.getTime() - at.getTime() < 60_000 ? 'Синхронізовано щойно' : `Синхронізовано о ${time.format(at)}`
}
