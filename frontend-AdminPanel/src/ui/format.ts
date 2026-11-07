export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')

export const formatDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '—'

/** 2026-11-08 as "8 лист." for chart axes */
export const formatDay = (day: string) => {
  const date = new Date(`${day}T12:00:00`)
  return Number.isNaN(date.getTime()) ? day : new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' }).format(date)
}

export const formatMinutes = (minutes: number) => (minutes >= 60 ? `${Math.floor(minutes / 60)} год ${minutes % 60} хв` : `${minutes} хв`)

const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['uk'], { type: 'region' }) : null

/** UA → Україна */
export const countryName = (code: string | null | undefined) => {
  if (!code) return '—'
  try {
    return regionNames?.of(code) ?? code
  } catch {
    return code
  }
}

export const DEVICE_LABELS: Record<string, string> = { mobile: 'Телефон', tablet: 'Планшет', desktop: 'Комп’ютер' }
export const MODE_LABELS: Record<string, string> = { installed: 'Встановлено (PWA)', browser: 'У браузері' }
