import { describe, expect, it } from 'vitest'
import { linearScale, niceTicks } from './scale'

describe('niceTicks', () => {
  it('starts at zero for magnitudes and uses round steps', () => {
    expect(niceTicks(0, 6480)).toEqual([0, 2000, 4000, 6000, 8000])
    expect(niceTicks(0, 37)).toEqual([0, 10, 20, 30, 40])
  })

  it('covers a range that does not start at zero', () => {
    expect(niceTicks(62.5, 85)).toEqual([60, 70, 80, 90])
  })

  it('gives a flat series a usable axis', () => {
    expect(niceTicks(0, 0)).toEqual([0, 0.25, 0.5, 0.75, 1])
    expect(niceTicks(80, 80).length).toBeGreaterThan(1)
  })
})

describe('linearScale', () => {
  it('maps a domain onto a range, inverted for SVG y', () => {
    const y = linearScale([0, 100], [200, 0])
    expect(y(0)).toBe(200)
    expect(y(50)).toBe(100)
    expect(y(100)).toBe(0)
  })
})
