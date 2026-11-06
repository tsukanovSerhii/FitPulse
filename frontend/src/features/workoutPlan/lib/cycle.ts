import { startOfWeek } from './week'
import type { CyclePhase, PlanExercise, WorkoutPlan } from '../model/types'

const DAY_MS = 24 * 60 * 60 * 1000
export const DELOAD_SHARE = 0.6

const round = (value: number, step = 2.5) => Math.max(step, Math.round(value / step) * step)

export interface CycleWeek {
  /** 1-based week of the cycle */
  week: number
  total: number
  phase: CyclePhase
}

/** Where a periodized plan is this week, or null when it has no cycle or the cycle is over. */
export function cycleWeek(plan: Pick<WorkoutPlan, 'cycle'>, now = new Date()): CycleWeek | null {
  if (!plan.cycle) return null
  const total = plan.cycle.phases.reduce((sum, p) => sum + p.weeks, 0)
  const week = Math.floor((startOfWeek(now).getTime() - startOfWeek(new Date(plan.cycle.startDate)).getTime()) / (7 * DAY_MS)) + 1
  if (week < 1 || week > total) return null
  let passed = 0
  for (const phase of plan.cycle.phases) {
    passed += phase.weeks
    if (week <= passed) return { week, total, phase }
  }
  return null
}

/** A light week switched on by hand that has not run out yet. */
export const manualDeload = (plan: Pick<WorkoutPlan, 'deloadUntil'>, now = new Date()) => Boolean(plan.deloadUntil && new Date(plan.deloadUntil) > now)

/** A light week: switched on by hand until a date, or planned by the cycle. */
export function isDeload(plan: Pick<WorkoutPlan, 'cycle' | 'deloadUntil'>, now = new Date()): boolean {
  if (manualDeload(plan, now)) return true
  return Boolean(cycleWeek(plan, now)?.phase.deload)
}

/** Light week from today for seven days. */
export const deloadUntilFrom = (now = new Date()) => new Date(now.getTime() + 7 * DAY_MS).toISOString()

export interface PreparedDay {
  exercises: PlanExercise[]
  deload: boolean
  /** "Тиждень 3 з 8 · Сила" */
  label?: string
}

/**
 * The exercises of a plan day as they should be done this week: sets and reps of the current cycle
 * phase, and in a light week fewer sets and about 60 % of the planned weight.
 */
export function prepareDay(plan: WorkoutPlan, items: PlanExercise[], now = new Date()): PreparedDay {
  const current = cycleWeek(plan, now)
  const deload = isDeload(plan, now)
  const exercises = items.map((item) => {
    const phase = current?.phase
    const sets = phase?.sets ?? item.sets
    const reps = phase?.reps ?? item.reps
    if (!deload) return { ...item, sets, reps }
    return { ...item, sets: Math.max(2, sets - 1), reps, ...(item.weight ? { weight: round(item.weight * DELOAD_SHARE) } : {}) }
  })
  const label = current ? `Тиждень ${current.week} з ${current.total} · ${current.phase.name}` : deload ? 'Легкий тиждень' : undefined
  return { exercises, deload, label }
}
