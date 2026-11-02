import type { Exercise, MovementPhase } from '@/features/exercises/model/types'
import type { MovementPattern } from '../athlete-rig/AthleteRig'

const ID_PATTERNS: [string[], MovementPattern][] = [
  [['bench-press', 'incline'], 'bench_press'],
  [['squat'], 'squat'],
  [['deadlift'], 'deadlift'],
  [['pull-up'], 'pull_up'],
  [['overhead-press', 'shoulder-press'], 'overhead_press'],
  [['row'], 'row'],
  [['push-up'], 'push_up'],
  [['dip'], 'dips'],
  [['curl'], 'bicep_curl'],
  [['pushdown', 'tricep'], 'tricep_pushdown'],
  [['plank'], 'plank'],
  [['leg-raise'], 'hanging_leg_raise'],
  [['lunge'], 'lunge'],
  [['lateral'], 'lateral_raise'],
  [['calf'], 'calf_raise'],
  [['swing'], 'kettlebell_swing'],
  [['treadmill', 'cardio', 'hiit'], 'cardio_run'],
]

const MUSCLE_PATTERNS: Partial<Record<Exercise['primaryMuscle'], MovementPattern>> = {
  chest: 'bench_press',
  legs: 'squat',
  calves: 'squat',
  back: 'pull_up',
  shoulders: 'overhead_press',
  biceps: 'bicep_curl',
  triceps: 'dips',
  abs: 'plank',
  glutes: 'deadlift',
}

export function getMovementPattern(exercise: Exercise): MovementPattern {
  const id = exercise.id.toLowerCase()
  const byId = ID_PATTERNS.find(([needles]) => needles.some((n) => id.includes(n)))
  return byId?.[1] ?? MUSCLE_PATTERNS[exercise.primaryMuscle] ?? 'squat'
}

export const DEFAULT_PHASES: MovementPhase[] = [
  {
    name: '1. Вихідне положення (Setup)',
    instruction: 'Займіть стабільну позицію, напружте кор, зведіть лопатки та зафіксуйте хват.',
    cue: 'Стабільний корпус, лопатки зібрані',
    breathing: 'inhale',
  },
  {
    name: '2. Ексцентрична фаза (Опускання)',
    instruction: "Підконтрольно опускайте вагу протягом 2-3 секунд, відчуваючи натягнення цільового м'яза.",
    cue: 'Повільний рух без ривків',
    breathing: 'inhale',
  },
  {
    name: '3. Пікова точка (Пауза)',
    instruction: 'Короткочасна фіксація в нижній амплітуді без втрати напруги та без відбиву від суглобів.',
    cue: 'Контроль без відскоку',
    breathing: 'hold',
  },
  {
    name: '4. Концентрична фаза (Підйом)',
    instruction: "Потужним рухом витисніть/підтягніть снаряд за рахунок цільових м'язів на видиху.",
    cue: 'Потужний видих на зусиллі',
    breathing: 'exhale',
  },
]

export const BREATHING_LABELS: Record<MovementPhase['breathing'], string> = {
  inhale: 'Вдих',
  exhale: 'Видих',
  hold: 'Затримка',
}

export const FRAME_LABELS: { title: string; description?: string }[] = [
  { title: 'Старт / Розтягнення', description: 'Початкова позиція вправи' },
  { title: 'Пікове скорочення', description: 'Верхня точка амплітуди' },
]

export const DEFAULT_TEMPO = '3-0-1-0'
