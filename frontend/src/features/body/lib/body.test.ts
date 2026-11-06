import { describe, expect, it } from 'vitest'
import { metricSeries, metricTrend } from './body'

const entries = [
  { id: 'c', date: '2026-11-04T08:00:00Z', weightKg: 80.4, waistCm: 84 },
  { id: 'b', date: '2026-10-20T08:00:00Z', waistCm: 85 },
  { id: 'a', date: '2026-09-01T08:00:00Z', weightKg: 83 },
  { id: 'd', date: '2026-10-10T08:00:00Z', weightKg: 81.6 },
]

describe('body measurements', () => {
  it('lists one metric oldest first and skips entries without it', () => {
    expect(metricSeries(entries, 'weightKg').map((p) => p.value)).toEqual([83, 81.6, 80.4])
    expect(metricSeries(entries, 'armCm')).toEqual([])
  })

  it('shows the latest value and the change over the last 30 days', () => {
    expect(metricTrend(entries, 'weightKg', { now: new Date('2026-11-05') })).toEqual({ value: 80.4, date: '2026-11-04T08:00:00Z', change: -1.2 })
    expect(metricTrend(entries, 'chestCm')).toBeNull()
  })
})
