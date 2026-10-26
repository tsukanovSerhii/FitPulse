import type { WorkoutPlan } from '@/features/workoutPlan/model/types'

export const INITIAL_PLANS: WorkoutPlan[] = [
  {
    id: 'plan-ppl-split',
    name: 'Push / Pull / Legs (3 дні на тиждень)',
    description: 'Класичний високоефективний спліт для зростання сили та м\'язової маси. Понеділок — жимові м\'язи, середа — тягові м\'язи, п\'ятниця — ноги та прес.',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
    schedule: {
      monday: [
        { id: 'ppl-mon-1', exerciseId: 'ex-bench-press', sets: 4, reps: 8, restSeconds: 90, weight: 70, order: 1, notes: 'Основний робочий жим' },
        { id: 'ppl-mon-2', exerciseId: 'ex-incline-dumbbell-press', sets: 3, reps: 10, restSeconds: 90, weight: 24, order: 2, notes: 'Акцент на верх грудей' },
        { id: 'ppl-mon-3', exerciseId: 'ex-overhead-press', sets: 3, reps: 8, restSeconds: 90, weight: 40, order: 3, notes: 'Плечі' },
        { id: 'ppl-mon-4', exerciseId: 'ex-lateral-raises', sets: 3, reps: 12, restSeconds: 60, weight: 10, order: 4, notes: 'Ізоляція середньої дельти' },
        { id: 'ppl-mon-5', exerciseId: 'ex-cable-pushdown', sets: 3, reps: 12, restSeconds: 60, weight: 25, order: 5, notes: 'Добиваємо трицепс' },
      ],
      tuesday: [],
      wednesday: [
        { id: 'ppl-wed-1', exerciseId: 'ex-deadlift', sets: 3, reps: 5, restSeconds: 150, weight: 110, order: 1, notes: 'Потужна станова тяга' },
        { id: 'ppl-wed-2', exerciseId: 'ex-pull-ups', sets: 4, reps: 8, restSeconds: 90, weight: 0, order: 2, notes: 'Широкий хват' },
        { id: 'ppl-wed-3', exerciseId: 'ex-barbell-row', sets: 4, reps: 10, restSeconds: 90, weight: 60, order: 3, notes: 'Тяга до поясу' },
        { id: 'ppl-wed-4', exerciseId: 'ex-dumbbell-curl', sets: 3, reps: 10, restSeconds: 60, weight: 14, order: 4, notes: 'Супінація біцепса' },
      ],
      thursday: [],
      friday: [
        { id: 'ppl-fri-1', exerciseId: 'ex-barbell-squat', sets: 4, reps: 8, restSeconds: 120, weight: 90, order: 1, notes: 'Глибокі присідання' },
        { id: 'ppl-fri-2', exerciseId: 'ex-dumbbell-lunges', sets: 3, reps: 12, restSeconds: 60, weight: 16, order: 2, notes: 'По 12 повторень на ногу' },
        { id: 'ppl-fri-3', exerciseId: 'ex-calf-raises', sets: 4, reps: 15, restSeconds: 60, weight: 40, order: 3, notes: 'Пауза у верхній точці' },
        { id: 'ppl-fri-4', exerciseId: 'ex-hanging-leg-raise', sets: 3, reps: 12, restSeconds: 60, weight: 0, order: 4, notes: 'Прес у висі' },
        { id: 'ppl-fri-5', exerciseId: 'ex-plank', sets: 3, reps: 60, restSeconds: 60, weight: 0, order: 5, notes: 'Фіксація кор-м\'язів' },
      ],
      saturday: [],
      sunday: [],
    },
  },
  {
    id: 'plan-full-body-starter',
    name: 'Full Body для початківців',
    description: 'Ідеальна програма для початківців та тих, хто повертається до тренувань після перерви. Опрацювання всього тіла за одне заняття.',
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
    schedule: {
      monday: [
        { id: 'fb-mon-1', exerciseId: 'ex-barbell-squat', sets: 3, reps: 10, restSeconds: 90, weight: 50, order: 1 },
        { id: 'fb-mon-2', exerciseId: 'ex-bench-press', sets: 3, reps: 10, restSeconds: 90, weight: 50, order: 2 },
        { id: 'fb-mon-3', exerciseId: 'ex-pull-ups', sets: 3, reps: 6, restSeconds: 90, weight: 0, order: 3 },
        { id: 'fb-mon-4', exerciseId: 'ex-plank', sets: 3, reps: 45, restSeconds: 60, weight: 0, order: 4 },
      ],
      tuesday: [],
      wednesday: [
        { id: 'fb-wed-1', exerciseId: 'ex-deadlift', sets: 3, reps: 8, restSeconds: 120, weight: 70, order: 1 },
        { id: 'fb-wed-2', exerciseId: 'ex-overhead-press', sets: 3, reps: 10, restSeconds: 90, weight: 30, order: 2 },
        { id: 'fb-wed-3', exerciseId: 'ex-dips', sets: 3, reps: 8, restSeconds: 90, weight: 0, order: 3 },
        { id: 'fb-wed-4', exerciseId: 'ex-dumbbell-curl', sets: 3, reps: 12, restSeconds: 60, weight: 10, order: 4 },
      ],
      thursday: [],
      friday: [
        { id: 'fb-fri-1', exerciseId: 'ex-dumbbell-lunges', sets: 3, reps: 12, restSeconds: 60, weight: 12, order: 1 },
        { id: 'fb-fri-2', exerciseId: 'ex-incline-dumbbell-press', sets: 3, reps: 10, restSeconds: 90, weight: 18, order: 2 },
        { id: 'fb-fri-3', exerciseId: 'ex-barbell-row', sets: 3, reps: 10, restSeconds: 90, weight: 45, order: 3 },
        { id: 'fb-fri-4', exerciseId: 'ex-kettlebell-swing', sets: 3, reps: 15, restSeconds: 60, weight: 16, order: 4 },
      ],
      saturday: [],
      sunday: [],
    },
  },
]
