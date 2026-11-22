// Ten weeks of a believable training history for the demo account, so every progress screen has
// something to show. Deterministic: the same start gives the same workouts, weights and body log.
import { BUILT_IN_EXERCISES } from '@/features/exercises/catalog'
import { PLAN_TEMPLATES } from '@/features/workoutPlan/catalog'
import { DAY_LABELS, planFromTemplate, type DayOfWeek, type PlanExercise } from '@/features/workoutPlan/model'
import { recalculatePersonalRecords, type ExerciseSummary, type LoggedSet, type WorkoutHistoryLog } from '@/features/progress/model'
import type { BodyEntry } from '@/features/body/model'
import type { UserProfile } from '@/features/profile/model'
import { STORAGE_KEYS } from '@/shared/storage/localStorage'
import { DEMO_ACCOUNT } from '@/shared/config/demo'

const WEEKS = 10
const TEMPLATE_ID = 'tpl-ppl-3'
const MINUTE = 60_000

/** Working weight in the first and the last week; no entry means bodyweight */
const LOADS: Record<string, [number, number]> = {
  'ex-bench-press': [60, 72.5],
  'ex-incline-dumbbell-press': [20, 26],
  'ex-dumbbell-shoulder-press': [16, 20],
  'ex-cable-crossover': [12.5, 17.5],
  'ex-lateral-raises': [8, 10],
  'ex-cable-pushdown': [20, 27.5],
  'ex-deadlift': [100, 125],
  'ex-seated-cable-row': [50, 62.5],
  'ex-face-pull': [15, 20],
  'ex-barbell-curl': [25, 32.5],
  'ex-hammer-curl': [12, 16],
  'ex-barbell-squat': [80, 100],
  'ex-romanian-deadlift': [60, 77.5],
  'ex-leg-press': [140, 175],
  'ex-lying-leg-curl': [35, 45],
  'ex-calf-raises': [60, 77.5],
}

/** Sessions the demo user missed, as [week, session]: real journals have gaps */
const SKIPPED = new Set(['3:2', '7:1'])

const DAY_INDEX: Record<DayOfWeek, number> = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 }

const exerciseName = (id: string) => BUILT_IN_EXERCISES.find((e) => e.id === id)?.name ?? id

/** Rounds to what the gym has: 2.5 kg plates and stacks, 1 kg dumbbell steps */
function roundLoad(id: string, kg: number): number {
  const step = BUILT_IN_EXERCISES.find((e) => e.id === id)?.equipment === 'dumbbell' ? 1 : 2.5
  return Math.round(kg / step) * step
}

/** Calendar days, not 24-hour steps: the range crosses a daylight saving change */
function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

function exerciseLog(exercise: PlanExercise, progress: number, seed: number): ExerciseSummary {
  const load = LOADS[exercise.exerciseId]
  const weight = load ? roundLoad(exercise.exerciseId, load[0] + (load[1] - load[0]) * progress) : undefined
  // Bodyweight moves add reps instead of weight; the last set is often a rep short
  const target = load ? exercise.reps : exercise.reps - 2 + Math.round(progress * 3)
  const sets: LoggedSet[] = Array.from({ length: exercise.sets }, (_, i) => ({
    reps: i === exercise.sets - 1 && (seed + i) % 3 === 0 ? target - 1 : target,
    ...(weight !== undefined && { weight }),
  }))
  const totalReps = sets.reduce((sum, s) => sum + s.reps, 0)
  return {
    exerciseId: exercise.exerciseId,
    exerciseName: exerciseName(exercise.exerciseId),
    setsCompleted: sets.length,
    totalReps,
    ...(weight !== undefined && { maxWeightKg: weight, repsAtMaxWeight: Math.max(...sets.map((s) => s.reps)) }),
    sets,
  }
}

function history(plan: ReturnType<typeof planFromTemplate>, firstWeek: Date, now: Date): WorkoutHistoryLog[] {
  const days = (Object.keys(plan.schedule) as DayOfWeek[]).filter((d) => plan.schedule[d].length > 0)
  const logs: WorkoutHistoryLog[] = []
  for (let week = 0; week < WEEKS; week++) {
    days.forEach((day, session) => {
      if (SKIPPED.has(`${week}:${session}`)) return
      const planned = addDays(firstWeek, week * 7 + DAY_INDEX[day])
      let date: Date
      if (planned.toDateString() === now.toDateString()) {
        // Today's session is already done, so the current week is never empty in the demo:
        // an hour and a half ago, or halfway since midnight for a visitor up that late
        date = new Date(now.getTime() - Math.min(90 * MINUTE, (now.getTime() - planned.getTime()) / 2))
      } else {
        date = new Date(planned)
        date.setHours(18 + (session % 2), 10 + ((week * 7 + session * 13) % 40))
      }
      if (date >= now) return
      const progress = week / (WEEKS - 1)
      const exercises = plan.schedule[day].map((exercise, i) => exerciseLog(exercise, progress, week + i))
      const totalSets = exercises.reduce((sum, e) => sum + e.setsCompleted, 0)
      const totalReps = exercises.reduce((sum, e) => sum + e.totalReps, 0)
      const totalVolumeKg = exercises.reduce((sum, e) => sum + (e.sets ?? []).reduce((v, s) => v + (s.weight ?? 0) * s.reps, 0), 0)
      const durationSeconds = (58 + ((week * 5 + session * 7) % 17)) * 60
      logs.push({
        id: `demo-w${week + 1}-${day}`,
        planId: plan.id,
        planName: plan.name,
        dayLabel: `${DAY_LABELS[day]} (${plan.name})`,
        date: date.toISOString(),
        durationSeconds,
        totalSets,
        totalReps,
        totalVolumeKg,
        caloriesBurned: Math.round((durationSeconds / 60) * 6.5),
        exercises,
      })
    })
  }
  return logs.sort((a, b) => b.date.localeCompare(a.date))
}

function bodyLog(firstWeek: Date, now: Date): BodyEntry[] {
  const entries: BodyEntry[] = []
  for (let week = 0; week < WEEKS; week++) {
    const date = addDays(firstWeek, week * 7 + 6)
    date.setHours(9, 0, 0, 0)
    if (date >= now) continue
    const t = week / (WEEKS - 1)
    // A slow lean gain with the small weekly noise of real weigh-ins
    const noise = [0, 0.3, -0.2, 0.1, -0.3, 0.2, 0, -0.1, 0.2, 0][week]
    entries.push({
      id: `demo-body-${week + 1}`,
      date: date.toISOString(),
      weightKg: Math.round((76 + 2.6 * t + noise) * 10) / 10,
      waistCm: Math.round((81 + 0.5 * t) * 2) / 2,
      chestCm: Math.round((100 + 2.5 * t) * 2) / 2,
      hipsCm: Math.round((96 + 1 * t) * 2) / 2,
      armCm: Math.round((35 + 1.5 * t) * 2) / 2,
    })
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date))
}

/** Every per-account storage value of the demo user, keyed like userStorage does. */
export function demoUserData(userId: string, now = new Date()): Record<string, unknown> {
  const firstWeek = addDays(startOfWeek(now), -(WEEKS - 1) * 7)
  const template = PLAN_TEMPLATES.find((t) => t.id === TEMPLATE_ID)!
  const plan = { ...planFromTemplate(template, { now: firstWeek }), id: 'demo-plan-ppl' }
  const logs = history(plan, firstWeek, now)
  const body = bodyLog(firstWeek, now)
  const profile: UserProfile = {
    name: DEMO_ACCOUNT.name,
    email: DEMO_ACCOUNT.email,
    gender: 'male',
    age: 27,
    heightCm: 180,
    weightKg: body[0]?.weightKg ?? 78,
    targetWeightKg: 82,
    fitnessGoal: 'muscle_gain',
    activityLevel: 'moderate',
    joinedDate: firstWeek.toISOString(),
    onboardedAt: firstWeek.toISOString(),
  }

  const data: Record<string, unknown> = {
    [STORAGE_KEYS.USER_PROFILE]: profile,
    [STORAGE_KEYS.WORKOUT_PLANS]: [plan],
    [STORAGE_KEYS.ACTIVE_PLAN_ID]: plan.id,
    [STORAGE_KEYS.WORKOUT_HISTORY]: logs,
    [STORAGE_KEYS.PERSONAL_RECORDS]: recalculatePersonalRecords(logs),
    [STORAGE_KEYS.WEEKLY_GOAL]: 3,
    [STORAGE_KEYS.BODY_LOG]: body,
  }
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [`${key}:${userId}`, value]))
}
