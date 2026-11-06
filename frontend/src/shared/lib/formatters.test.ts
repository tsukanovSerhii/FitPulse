import { describe, expect, it } from 'vitest'
import { formatNumber, plural } from './formatters'

describe('formatNumber', () => {
  it('groups thousands with a narrow no-break space', () => {
    expect(formatNumber(12480)).toBe('12\u202f480')
    expect(formatNumber(1.25, 1)).toBe('1,3')
  })
})

describe('plural', () => {
  const days: [string, string, string] = ['день', 'дні', 'днів']
  it.each([
    [1, '1 день'],
    [3, '3 дні'],
    [5, '5 днів'],
    [11, '11 днів'],
    [21, '21 день'],
    [0, '0 днів'],
  ])('%i', (count, expected) => expect(plural(count, days)).toBe(expected))
})
