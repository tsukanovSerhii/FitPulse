import { describe, expect, it } from 'vitest'
import { PLAN_TEMPLATES } from '../api/templates'
import type { WorkoutPlan } from '../model/types'
import { cycleWeek, deloadUntilFrom, isDeload, prepareDay } from './cycle'
import { planFromTemplate } from './templates'

const template = PLAN_TEMPLATES.find((t) => t.id === 'tpl-strength-8-weeks')!
const start = new Date('2026-11-02T10:00:00') // a Monday
const weeksLater = (n: number) => new Date(start.getTime() + n * 7 * 24 * 3600 * 1000)
const item = { id: 'a', exerciseId: 'ex-bench-press', sets: 3, reps: 10, restSeconds: 90, order: 1, weight: 80 }

describe('periodized plans', () => {
  const plan = planFromTemplate(template, { now: start })

  it('starts the cycle this week and walks through its phases', () => {
    expect(cycleWeek(plan, start)).toMatchObject({ week: 1, total: 8, phase: { name: 'Об’єм' } })
    expect(cycleWeek(plan, weeksLater(3))).toMatchObject({ week: 4, phase: { deload: true } })
    expect(cycleWeek(plan, weeksLater(4))).toMatchObject({ week: 5, phase: { name: 'Сила', reps: 5 } })
    expect(cycleWeek(plan, weeksLater(8))).toBeNull()
  })

  it('uses the sets and reps of the current phase', () => {
    expect(prepareDay(plan, [item], weeksLater(5))).toMatchObject({ exercises: [{ sets: 5, reps: 5, weight: 80 }], deload: false, label: 'Тиждень 6 з 8 · Сила' })
  })

  it('makes a light week lighter: fewer sets, about 60 % of the weight', () => {
    const day = prepareDay(plan, [item], weeksLater(3))
    expect(day.deload).toBe(true)
    expect(day.exercises[0]).toMatchObject({ sets: 2, weight: 47.5 })
  })
})

describe('light week by hand', () => {
  const plan = { id: 'p', name: 'P', createdAt: '', updatedAt: '', schedule: {} } as unknown as WorkoutPlan

  it('lasts seven days', () => {
    const on = { ...plan, deloadUntil: deloadUntilFrom(start) }
    expect(isDeload(on, weeksLater(0.5))).toBe(true)
    expect(isDeload(on, weeksLater(1.1))).toBe(false)
    expect(prepareDay(on, [item], start)).toMatchObject({ deload: true, label: 'Легкий тиждень', exercises: [{ sets: 2, weight: 47.5 }] })
  })

  it('changes nothing in a normal week', () => {
    expect(prepareDay(plan, [item], start)).toEqual({ exercises: [item], deload: false, label: undefined })
  })
})

describe('home programs', () => {
  it('need no machines, cables or barbells', () => {
    const homeIds = PLAN_TEMPLATES.filter((t) => t.home && t.id !== 'tpl-dumbbells').flatMap((t) => Object.values(t.schedule).flat().map((e) => e!.exerciseId))
    expect(homeIds.length).toBeGreaterThan(0)
    for (const id of homeIds) expect(['ex-goblet-squat'].includes(id) || !/smith|cable|machine|barbell|leg-press|pulldown/.test(id), id).toBe(true)
  })
})
