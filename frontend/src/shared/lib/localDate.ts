/** YYYY-MM-DD of the local calendar day, as <input type="date"> expects; toISOString() would give the UTC day. */
export function localDateInput(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
