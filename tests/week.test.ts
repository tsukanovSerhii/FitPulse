import { describe, expect, it } from 'vitest'
import { dayKeyOf, nextTrainingDay, startOfWeek } from '@/features/dashboard/lib/week'

describe('week helpers', () => {
  it('maps dates to day keys with Monday first', () => {
    expect(dayKeyOf(new Date(2026, 10, 2))).toBe('monday')
    expect(dayKeyOf(new Date(2026, 10, 8))).toBe('sunday')
  })

  it('starts the week on Monday', () => {
    expect(startOfWeek(new Date(2026, 10, 8, 15)).getDate()).toBe(2)
    expect(startOfWeek(new Date(2026, 10, 2, 9)).getDate()).toBe(2)
  })

  it('finds the next training day, wrapping to next week', () => {
    const training = new Set(['monday', 'wednesday'])
    expect(nextTrainingDay('monday', (d) => training.has(d))).toBe('wednesday')
    expect(nextTrainingDay('friday', (d) => training.has(d))).toBe('monday')
    expect(nextTrainingDay('friday', () => false)).toBeNull()
  })
})
