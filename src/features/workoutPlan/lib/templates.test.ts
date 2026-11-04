import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PLAN_TEMPLATES } from '../api/templates'
import { ALL_DAYS } from '../model/types'
import { filterTemplates, planFromTemplate, templateDays } from './templates'

describe('plan templates', () => {
  it('have unique ids', () => {
    expect(new Set(PLAN_TEMPLATES.map((t) => t.id)).size).toBe(PLAN_TEMPLATES.length)
  })

  // Every built-in exercise ships its photos in public/exercises/<id>
  it.each(PLAN_TEMPLATES.map((t) => [t.id, t] as const))('%s uses only catalog exercises', (_, template) => {
    for (const day of templateDays(template)) {
      for (const exercise of template.schedule[day]!) expect(existsSync(`public/exercises/${exercise.exerciseId}`), exercise.exerciseId).toBe(true)
    }
  })

  it('filters by days per week and goal', () => {
    const byDays = filterTemplates(PLAN_TEMPLATES, { days: '6+', goal: 'all' })
    expect(byDays.map((t) => t.id)).toEqual(['tpl-ppl-6', 'tpl-arnold-split'])
    const strength = filterTemplates(PLAN_TEMPLATES, { days: 'all', goal: 'strength' })
    expect(strength.every((t) => t.goal === 'strength')).toBe(true)
    expect(filterTemplates(PLAN_TEMPLATES, { days: 'all', goal: 'all' })).toHaveLength(PLAN_TEMPLATES.length)
  })
})

describe('planFromTemplate', () => {
  const template = PLAN_TEMPLATES.find((t) => t.id === 'tpl-strength-5x5')!
  const now = new Date('2026-11-03T10:00:00.000Z')

  it('copies the schedule with fresh ids and order', () => {
    const plan = planFromTemplate(template, { now })
    expect(plan).toMatchObject({ id: `plan-${now.getTime()}`, templateId: template.id, name: template.name, createdAt: now.toISOString() })
    expect(Object.keys(plan.schedule)).toEqual(ALL_DAYS)
    expect(plan.schedule.tuesday).toEqual([])
    expect(plan.schedule.monday.map((e) => e.order)).toEqual([1, 2, 3])
    expect(new Set(ALL_DAYS.flatMap((d) => plan.schedule[d].map((e) => e.id))).size).toBe(9)
  })

  it('does not share exercise objects with the template', () => {
    const plan = planFromTemplate(template, { now })
    plan.schedule.monday[0].sets = 99
    expect(template.schedule.monday![0].sets).toBe(5)
  })

  it('puts the sessions on the days the user picked', () => {
    const plan = planFromTemplate(template, { now, days: ['tuesday', 'thursday', 'sunday'] })
    expect(ALL_DAYS.filter((d) => plan.schedule[d].length > 0)).toEqual(['tuesday', 'thursday', 'sunday'])
    expect(plan.schedule.sunday.map((e) => e.exerciseId)).toEqual(template.schedule.friday!.map((e) => e.exerciseId))
    expect(plan.schedule.tuesday[0].id).toBe(`tuesday-1-${now.getTime()}`)
  })
})
