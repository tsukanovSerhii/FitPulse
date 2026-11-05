import type { BodyEntry, BodyMetric } from '../model/types'

/** One metric over time, oldest first, skipping entries that did not measure it. */
export function metricSeries(entries: BodyEntry[], metric: BodyMetric): { date: string; value: number }[] {
  return entries
    .flatMap((e) => (e[metric] !== undefined ? [{ date: e.date, value: e[metric]! }] : []))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Latest value of a metric and how it changed since the first measurement in the last `days` days. */
export function metricTrend(entries: BodyEntry[], metric: BodyMetric, { days = 30, now = new Date() } = {}) {
  const series = metricSeries(entries, metric)
  const latest = series.at(-1)
  if (!latest) return null
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  const base = series.find((p) => p.date >= since) ?? latest
  return { value: latest.value, date: latest.date, change: Math.round((latest.value - base.value) * 10) / 10 }
}
