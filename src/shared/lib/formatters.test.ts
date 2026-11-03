import { describe, expect, it } from 'vitest'
import { formatNumber } from './formatters'

describe('formatNumber', () => {
  it('groups thousands with a narrow no-break space', () => {
    expect(formatNumber(12480)).toBe('12\u202f480')
    expect(formatNumber(1.25, 1)).toBe('1,3')
  })
})
