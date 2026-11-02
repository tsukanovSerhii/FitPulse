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

export function formatMinutes(seconds: number): string {
  const mins = Math.round(seconds / 60)
  return `${mins} хв`
}

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

export function formatWeight(kg?: number): string {
  if (kg === undefined || kg === null) return '—'
  if (kg === 0) return 'Власна вага'
  return `${kg} кг`
}

/** Groups digits with a narrow no-break space so monospace numbers have no visible gap. */
export function formatNumber(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('uk-UA', { maximumFractionDigits }).format(value).replace(/\s/g, '\u202f')
}
