import { describe, expect, it } from 'vitest'
import { BUILT_IN_EXERCISES } from '@/features/exercises/catalog'
import { PLAN_TEMPLATES } from '@/features/workoutPlan/catalog'
import { fullTitle, isPublicPath } from '@/shared/seo/meta'
import { CATALOG_META, exerciseDescription, exercisePath, exerciseTitle, programDescription, programPath, programTitle } from './content'
import { publicPages } from './prerender'

const inRange = (text: string, min: number, max: number) => text.length >= min && text.length <= max

describe('public catalog pages', () => {
  it.each(BUILT_IN_EXERCISES.map((e) => [e.id, e] as const))('%s has a title and description search engines show in full', (_, e) => {
    expect(inRange(fullTitle(exerciseTitle(e)), 30, 60), fullTitle(exerciseTitle(e))).toBe(true)
    expect(inRange(exerciseDescription(e), 70, 160), exerciseDescription(e)).toBe(true)
  })

  it.each(PLAN_TEMPLATES.map((t) => [t.id, t] as const))('%s has a title and description search engines show in full', (_, t) => {
    expect(inRange(fullTitle(programTitle(t)), 30, 60), fullTitle(programTitle(t))).toBe(true)
    expect(inRange(programDescription(t), 70, 160), programDescription(t)).toBe(true)
  })

  it('catalog meta fits too', () => {
    expect(inRange(fullTitle(CATALOG_META.title), 30, 60)).toBe(true)
    expect(inRange(CATALOG_META.description, 70, 160)).toBe(true)
  })

  it('gives every exercise and program its own indexable URL', () => {
    const pages = publicPages()
    const paths = pages.map((p) => p.path)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths).toHaveLength(1 + BUILT_IN_EXERCISES.length + PLAN_TEMPLATES.length)
    expect(paths).toContain(exercisePath('ex-bench-press'))
    expect(paths).toContain(programPath('tpl-ppl-3'))
    expect(paths.every(isPublicPath)).toBe(true)
    expect(isPublicPath('/progress')).toBe(false)
  })

  it('writes readable HTML with links between pages', () => {
    const bench = publicPages().find((p) => p.path === '/exercise/bench-press')!
    expect(bench.body).toContain('<h1>Жим штанги лежачи</h1>')
    expect(bench.body).toContain('<h2>Техніка виконання</h2>')
    expect(bench.body).toContain('href="/exercise/dumbbell-bench-press"')
    expect(bench.body).not.toMatch(/<script/i)
  })
})
