import { describe, expect, it } from 'vitest'
import type { WorkoutHistoryLog } from '@/features/progress/model'
import type { BodyEntry } from '@/features/body/model'
import { needsOnboarding, type UserProfile } from '@/features/profile/model'
import { demoUserData } from './demoSeed'

// A Wednesday at noon: Monday's session is logged, and Wednesday's counts as done this morning
const NOW = new Date(2026, 10, 25, 12, 0)
const data = demoUserData('u1', NOW)
const history = data['fitpulse_history_v1:u1'] as WorkoutHistoryLog[]
const benchWeights = () =>
  [...history]
    .reverse()
    .flatMap((log) => log.exercises.filter((e) => e.exerciseId === 'ex-bench-press'))
    .map((e) => e.maxWeightKg!)

describe('demo account data', () => {
  it('keeps every value under the account’s own keys', () => {
    expect(Object.keys(data).every((key) => key.endsWith(':u1'))).toBe(true)
  })

  it('logs ten weeks of the plan up to today, minus missed sessions', () => {
    // 9 full weeks of 3 sessions, 2 skipped, and this week's Monday and Wednesday
    expect(history).toHaveLength(9 * 3 - 2 + 2)
    expect(new Date(history[0].date).toDateString()).toBe(NOW.toDateString())
    expect(history.every((log) => new Date(log.date) < NOW)).toBe(true)
    expect(history[0].date > history.at(-1)!.date).toBe(true)
  })

  it('progresses the working weights and keeps the totals consistent', () => {
    const weights = benchWeights()
    expect(weights[0]).toBe(60)
    expect(weights.at(-1)!).toBeGreaterThan(weights[0])
    expect(weights).toEqual([...weights].sort((a, b) => a - b))

    for (const log of history) {
      const sets = log.exercises.flatMap((e) => e.sets ?? [])
      expect(log.totalSets).toBe(sets.length)
      expect(log.totalReps).toBe(sets.reduce((sum, s) => sum + s.reps, 0))
      expect(log.totalVolumeKg).toBe(sets.reduce((sum, s) => sum + (s.weight ?? 0) * s.reps, 0))
    }
  })

  it('has records, a body log and a finished questionnaire', () => {
    const records = data['fitpulse_prs_v1:u1'] as Record<string, { maxWeightKg: number }>
    expect(records['ex-bench-press'].maxWeightKg).toBe(Math.max(...benchWeights()))
    expect((data['fitpulse_body_log_v1:u1'] as BodyEntry[]).length).toBeGreaterThanOrEqual(9)
    expect(needsOnboarding(data['fitpulse_profile_v1:u1'] as UserProfile)).toBe(false)
    expect(data['fitpulse_active_plan_id_v1:u1']).toBe('demo-plan-ppl')
  })

  it('is the same for the same moment', () => {
    expect(demoUserData('u1', NOW)).toEqual(data)
  })
})

describe('demo account data just after midnight', () => {
  it('still counts today’s session as done today', () => {
    const lateNight = new Date(2026, 10, 25, 0, 30)
    const logs = demoUserData('u1', lateNight)['fitpulse_history_v1:u1'] as WorkoutHistoryLog[]
    expect(new Date(logs[0].date).toDateString()).toBe(lateNight.toDateString())
    expect(logs.every((log) => new Date(log.date) < lateNight)).toBe(true)
  })

  it('keeps evening times across the daylight saving change', () => {
    expect(history.filter((log) => new Date(log.date).toDateString() !== NOW.toDateString()).every((log) => new Date(log.date).getHours() >= 18)).toBe(true)
  })
})
