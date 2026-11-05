import { describe, expect, it } from 'vitest'
import type { WorkoutHistoryLog } from '../model/types'
import { weeklyGoalStats } from './weeklyGoal'

const log = (date: string) => ({ id: date, date, exercises: [] }) as unknown as WorkoutHistoryLog
// Mondays: 2026-10-12, 10-19, 10-26, 11-02
const now = new Date('2026-11-04T12:00:00')

describe('weeklyGoalStats', () => {
  it('counts this week and the streak of weeks before it', () => {
    const history = ['2026-10-13', '2026-10-15', '2026-10-20', '2026-10-22', '2026-10-27', '2026-10-29', '2026-11-03'].map((d) => log(`${d}T10:00:00`))
    expect(weeklyGoalStats(history, 2, now)).toEqual({ goal: 2, done: 1, streak: 3, best: 3 })
  })

  it('adds this week once the goal is met', () => {
    const history = ['2026-10-27', '2026-10-29', '2026-11-02', '2026-11-03'].map((d) => log(`${d}T10:00:00`))
    expect(weeklyGoalStats(history, 2, now)).toMatchObject({ done: 2, streak: 2 })
  })

  it('a missed week breaks the streak but keeps the best one', () => {
    const history = ['2026-10-05', '2026-10-06', '2026-10-12', '2026-10-13', '2026-10-27', '2026-10-28'].map((d) => log(`${d}T10:00:00`))
    expect(weeklyGoalStats(history, 2, now)).toMatchObject({ streak: 1, best: 2 })
  })

  it('starts empty', () => {
    expect(weeklyGoalStats([], 3, now)).toEqual({ goal: 3, done: 0, streak: 0, best: 0 })
  })
})
