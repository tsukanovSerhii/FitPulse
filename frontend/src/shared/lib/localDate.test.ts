import { describe, expect, it } from 'vitest'
import { localDateInput } from './localDate'

describe('localDateInput', () => {
  it('uses the local calendar day, not the UTC one', () => {
    // Half past midnight locally is still the previous day in UTC east of Greenwich
    expect(localDateInput(new Date(2026, 10, 7, 0, 30))).toBe('2026-11-07')
    expect(localDateInput(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
