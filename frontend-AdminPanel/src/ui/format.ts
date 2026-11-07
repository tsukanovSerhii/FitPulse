export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')

export const formatDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '—'
