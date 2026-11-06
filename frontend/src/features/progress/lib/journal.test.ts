import { describe, expect, it } from 'vitest'
import type { PersonalRecord, WorkoutHistoryLog } from '../model/types'
import { filterJournal, groupByMonth, monthCalendar, recordExerciseIds } from './journal'

const log = (id: string, date: string, extra: Partial<WorkoutHistoryLog> = {}): WorkoutHistoryLog => ({
  id,
  planName: 'Push / Pull / Legs',
  dayLabel: 'Понеділок (Push)',
  date,
  durationSeconds: 3000,
  totalSets: 16,
  totalReps: 120,
  totalVolumeKg: 5000,
  caloriesBurned: 300,
  exercises: [{ exerciseId: 'bench', exerciseName: 'Жим штанги лежачи', setsCompleted: 4, totalReps: 32, maxWeightKg: 80 }],
  ...extra,
})

const history = [
  log('a', '2026-11-02T10:00:00.000Z'),
  log('b', '2026-10-28T10:00:00.000Z', { totalVolumeKg: 3000, planName: 'Full Body', exercises: [] }),
  log('c', '2026-11-04T10:00:00.000Z', { totalVolumeKg: 2000 }),
]

describe('groupByMonth', () => {
  it('groups newest first with totals per month', () => {
    const groups = groupByMonth(history)
    expect(groups.map((g) => g.key)).toEqual(['2026-11', '2026-10'])
    expect(groups[0].logs.map((l) => l.id)).toEqual(['c', 'a'])
    expect(groups[0].totals).toEqual({ workouts: 2, volumeKg: 7000, seconds: 6000 })
  })
})

describe('monthCalendar', () => {
  it('lays out a Monday-first grid with training days marked', () => {
    const weeks = monthCalendar(2026, 10, history)
    expect(weeks[0][0].date.getDate()).toBe(26)
    expect(weeks[0][0].inMonth).toBe(false)
    const days = weeks.flat()
    expect(days.find((d) => d.inMonth && d.date.getDate() === 2)?.logs.map((l) => l.id)).toEqual(['a'])
    expect(days.every((d) => d.date.getDay() === days[days.indexOf(d) % 7].date.getDay())).toBe(true)
    expect(weeks.every((w) => w.length === 7)).toBe(true)
  })
})

describe('filterJournal', () => {
  it('matches exercise names and plan names case-insensitively', () => {
    expect(filterJournal(history, { query: 'жим', plan: '' }).map((l) => l.id)).toEqual(['a', 'c'])
    expect(filterJournal(history, { query: '', plan: 'Full Body' }).map((l) => l.id)).toEqual(['b'])
    expect(filterJournal(history, { query: 'присід', plan: '' })).toEqual([])
  })
})

describe('recordExerciseIds', () => {
  it('marks exercises whose record was set in that session', () => {
    const records: Record<string, PersonalRecord> = {
      bench: { exerciseId: 'bench', exerciseName: 'Жим', maxWeightKg: 80, maxReps: 8, achievedAt: '2026-11-02T10:00:00.000Z' },
    }
    expect(recordExerciseIds(history[0], records)).toEqual(new Set(['bench']))
    expect(recordExerciseIds(history[2], records)).toEqual(new Set())
  })
})
