import { describe, expect, it } from 'vitest'
import { matchesSearch } from '@/shared/lib/search'
import { INITIAL_EXERCISES } from '../api/seed'
import { SEARCH_ALIASES } from '../api/catalog/aliases'
import { searchText } from './variants'

const find = (query: string) => INITIAL_EXERCISES.filter((e) => matchesSearch(searchText(e), query)).map((e) => e.id)

describe('exercise search', () => {
  it('finds exercises by slang, Russian and English names', () => {
    expect(find('бенч')).toContain('ex-bench-press')
    expect(find('bench press')).toEqual(expect.arrayContaining(['ex-bench-press', 'ex-dumbbell-bench-press', 'ex-smith-bench-press']))
    expect(find('становая')).toContain('ex-deadlift')
    expect(find('присед')).toContain('ex-barbell-squat')
    expect(find('squat')).toContain('ex-front-squat')
    expect(find('скакалка')).toEqual(['ex-jump-rope'])
  })

  it('every alias points to a real exercise', () => {
    const ids = new Set(INITIAL_EXERCISES.map((e) => e.id))
    for (const id of Object.keys(SEARCH_ALIASES)) expect(ids.has(id), id).toBe(true)
  })
})
