import type { WorkoutHistoryLog, PersonalRecord } from '@/features/progress/model/types'

export const INITIAL_HISTORY: WorkoutHistoryLog[] = [
  {
    id: 'hist-1',
    planId: 'plan-ppl-split',
    planName: 'Push / Pull / Legs (3 дні на тиждень)',
    dayLabel: 'Понеділок (Push)',
    date: '2026-03-23T18:30:00.000Z',
    durationSeconds: 3120, // 52 хв
    totalSets: 16,
    totalReps: 144,
    totalVolumeKg: 6480,
    caloriesBurned: 380,
    exercises: [
      { exerciseId: 'ex-bench-press', exerciseName: 'Жим штанги лежачи', setsCompleted: 4, totalReps: 32, maxWeightKg: 75 },
      { exerciseId: 'ex-incline-dumbbell-press', exerciseName: 'Жим гантелей на похилій лаві', setsCompleted: 3, totalReps: 30, maxWeightKg: 24 },
      { exerciseId: 'ex-overhead-press', exerciseName: 'Армійський жим стоячи', setsCompleted: 3, totalReps: 24, maxWeightKg: 40 },
      { exerciseId: 'ex-lateral-raises', exerciseName: 'Махи гантелями в сторони', setsCompleted: 3, totalReps: 36, maxWeightKg: 10 },
      { exerciseId: 'ex-cable-pushdown', exerciseName: 'Розгинання рук на блоці (трицепс)', setsCompleted: 3, totalReps: 36, maxWeightKg: 25 },
    ],
  },
  {
    id: 'hist-2',
    planId: 'plan-ppl-split',
    planName: 'Push / Pull / Legs (3 дні на тиждень)',
    dayLabel: 'Середа (Pull)',
    date: '2026-03-25T18:00:00.000Z',
    durationSeconds: 3450, // 57.5 хв
    totalSets: 14,
    totalReps: 112,
    totalVolumeKg: 7920,
    caloriesBurned: 420,
    exercises: [
      { exerciseId: 'ex-deadlift', exerciseName: 'Станова тяга', setsCompleted: 3, totalReps: 15, maxWeightKg: 120 },
      { exerciseId: 'ex-pull-ups', exerciseName: 'Підтягування широким хватом', setsCompleted: 4, totalReps: 32, maxWeightKg: 0 },
      { exerciseId: 'ex-barbell-row', exerciseName: 'Тяга штанги в нахилі', setsCompleted: 4, totalReps: 40, maxWeightKg: 65 },
      { exerciseId: 'ex-dumbbell-curl', exerciseName: 'Підйом гантелей на біцепс стоячи', setsCompleted: 3, totalReps: 30, maxWeightKg: 14 },
    ],
  },
  {
    id: 'hist-3',
    planId: 'plan-ppl-split',
    planName: 'Push / Pull / Legs (3 дні на тиждень)',
    dayLabel: 'П\'ятниця (Legs)',
    date: '2026-03-27T17:45:00.000Z',
    durationSeconds: 3600, // 60 хв
    totalSets: 17,
    totalReps: 172,
    totalVolumeKg: 8500,
    caloriesBurned: 460,
    exercises: [
      { exerciseId: 'ex-barbell-squat', exerciseName: 'Присідання зі штангою на плечах', setsCompleted: 4, totalReps: 32, maxWeightKg: 95 },
      { exerciseId: 'ex-dumbbell-lunges', exerciseName: 'Випади з гантелями', setsCompleted: 3, totalReps: 36, maxWeightKg: 16 },
      { exerciseId: 'ex-calf-raises', exerciseName: 'Підйом на носки стоячи', setsCompleted: 4, totalReps: 60, maxWeightKg: 40 },
      { exerciseId: 'ex-hanging-leg-raise', exerciseName: 'Підйом ніг у висі на турніку', setsCompleted: 3, totalReps: 36, maxWeightKg: 0 },
      { exerciseId: 'ex-plank', exerciseName: 'Класична планка', setsCompleted: 3, totalReps: 180, maxWeightKg: 0 },
    ],
  },
]

export const INITIAL_PRS: Record<string, PersonalRecord> = {
  'ex-bench-press': {
    exerciseId: 'ex-bench-press',
    exerciseName: 'Жим штанги лежачи',
    maxWeightKg: 85,
    maxReps: 5,
    achievedAt: '2026-03-20T18:40:00.000Z',
  },
  'ex-barbell-squat': {
    exerciseId: 'ex-barbell-squat',
    exerciseName: 'Присідання зі штангою на плечах',
    maxWeightKg: 105,
    maxReps: 6,
    achievedAt: '2026-03-18T19:00:00.000Z',
  },
  'ex-deadlift': {
    exerciseId: 'ex-deadlift',
    exerciseName: 'Станова тяга',
    maxWeightKg: 130,
    maxReps: 4,
    achievedAt: '2026-03-25T18:25:00.000Z',
  },
  'ex-overhead-press': {
    exerciseId: 'ex-overhead-press',
    exerciseName: 'Армійський жим стоячи',
    maxWeightKg: 45,
    maxReps: 6,
    achievedAt: '2026-03-15T18:15:00.000Z',
  },
}
