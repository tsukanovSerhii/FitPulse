import { describe, expect, it } from 'vitest'
import { ALL_DAYS, type WorkoutPlan } from '../model/types'
import { applyPlanEdit } from './planEdits'

const plan = (ids: string[]): WorkoutPlan => ({
  id: 'p',
  name: 'P',
  createdAt: '',
  updatedAt: '',
  schedule: {
    ...(Object.fromEntries(ALL_DAYS.map((d) => [d, []])) as unknown as WorkoutPlan['schedule']),
    monday: ids.map((id, i) => ({ id, exerciseId: `ex-${id}`, sets: 3, reps: 10, restSeconds: 60, order: i + 1 })),
  },
})
const groups = (p: WorkoutPlan) => p.schedule.monday.map((e) => e.group ?? '-')
const link = (p: WorkoutPlan, exerciseId: string, groupId = 'g') => applyPlanEdit(p, { type: 'link', day: 'monday', exerciseId, groupId })

describe('supersets in a plan day', () => {
  it('joins an exercise with the next one', () => {
    const p = plan(['a', 'b', 'c'])
    link(p, 'a')
    expect(groups(p)).toEqual(['g', 'g', '-'])
  })

  it('grows a superset into a tri-set', () => {
    const p = plan(['a', 'b', 'c'])
    link(p, 'a')
    link(p, 'b', 'other')
    expect(groups(p)).toEqual(['g', 'g', 'g'])
  })

  it('splits a superset and drops lone members', () => {
    const p = plan(['a', 'b', 'c'])
    link(p, 'a')
    link(p, 'b')
    link(p, 'a', 'tail')
    expect(groups(p)).toEqual(['-', 'tail', 'tail'])
  })

  it('removing a member of a pair ends the superset', () => {
    const p = plan(['a', 'b', 'c'])
    link(p, 'a')
    applyPlanEdit(p, { type: 'remove', day: 'monday', exerciseId: 'b' })
    expect(groups(p)).toEqual(['-', '-'])
  })
})
