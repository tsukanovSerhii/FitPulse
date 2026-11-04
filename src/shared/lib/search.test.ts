import { describe, expect, it } from 'vitest'
import { matchesSearch, normalizeSearch } from './search'

describe('matchesSearch', () => {
  it('folds Ukrainian, Russian and apostrophe spellings', () => {
    expect(normalizeSearch("Зведення в «Батерфляй», м’язи")).toBe('зведення в батерфляй мязи')
    expect(matchesSearch('Жим штанги лежачи', 'жим лёжа')).toBe(true)
    expect(matchesSearch('Підтягування', 'пидтяг')).toBe(true)
  })

  it('needs every word of the query, in any order', () => {
    expect(matchesSearch('Тяга верхнього блока широким хватом', 'блок тяга')).toBe(true)
    expect(matchesSearch('Тяга верхнього блока широким хватом', 'тяга штанги')).toBe(false)
  })
})
