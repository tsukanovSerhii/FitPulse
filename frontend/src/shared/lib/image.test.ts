import { describe, expect, it } from 'vitest'
import { validateImageFile } from './image'

describe('validateImageFile', () => {
  it('accepts common image types under 5 MB', () => {
    expect(validateImageFile({ type: 'image/jpeg', size: 200_000 })).toBeNull()
    expect(validateImageFile({ type: 'image/png', size: 4_000_000 })).toBeNull()
  })

  it('rejects other types and oversized files', () => {
    expect(validateImageFile({ type: 'application/pdf', size: 1000 })).toMatch(/JPG/)
    expect(validateImageFile({ type: 'image/png', size: 6 * 1024 * 1024 })).toMatch(/5 МБ/)
  })
})
