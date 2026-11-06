import { describe, expect, it } from 'vitest'
import { fullTitle } from '@/shared/seo/meta'
import { PAGE_META } from './meta'

describe('page meta', () => {
  it.each(Object.entries(PAGE_META))('%s has a title of 30-60 and a description of 70-160 characters', (_, meta) => {
    const title = fullTitle(meta.title)
    expect(title.length, title).toBeGreaterThanOrEqual(30)
    expect(title.length, title).toBeLessThanOrEqual(60)
    expect(meta.description.length, meta.description).toBeGreaterThanOrEqual(70)
    expect(meta.description.length, meta.description).toBeLessThanOrEqual(160)
  })
})
