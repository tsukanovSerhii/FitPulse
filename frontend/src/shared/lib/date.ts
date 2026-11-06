/** Monday 00:00 of the week that contains `date`. */
export function startOfWeek(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((date.getDay() + 6) % 7))
  return start
}
