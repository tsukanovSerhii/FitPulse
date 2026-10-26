/**
 * Форматування секунд у формат ММ:СС або ГГ:ММ:СС
 */
export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hrs = Math.floor(safeSeconds / 3600)
  const mins = Math.floor((safeSeconds % 3600) / 60)
  const secs = safeSeconds % 60

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Форматування хвилин для відображення тривалості (напр. "55 хв")
 */
export function formatMinutes(seconds: number): string {
  const mins = Math.round(seconds / 60)
  return `${mins} хв`
}

/**
 * Форматування дати у зрозумілий український формат (напр. "23 березня 2026")
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return isoString
  }
}

/**
 * Форматування короткої дати (напр. "23.03 18:30")
 */
export function formatShortDateTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

/**
 * Форматування ваги (наприклад "85 кг")
 */
export function formatWeight(kg?: number): string {
  if (kg === undefined || kg === null) return '—'
  if (kg === 0) return 'Власна вага'
  return `${kg} кг`
}
