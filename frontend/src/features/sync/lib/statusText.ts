import type { SyncState } from '../model/syncSlice'

const time = new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' })

export function syncStatusText({ status, lastSyncedAt, pendingDeletes }: Pick<SyncState, 'status' | 'lastSyncedAt' | 'pendingDeletes'>, now = new Date()): string {
  if (status === 'confirmDelete') return `На цьому пристрої зникли ${pendingDeletes ?? 0} записів. Видалити їх і на інших пристроях?`
  if (status === 'offline') return 'Очікує мережі'
  if (status === 'error') return 'Помилка синхронізації'
  if (!lastSyncedAt) return status === 'syncing' ? 'Синхронізуємо…' : 'Ще не синхронізовано'
  const at = new Date(lastSyncedAt)
  return now.getTime() - at.getTime() < 60_000 ? 'Синхронізовано щойно' : `Синхронізовано о ${time.format(at)}`
}
