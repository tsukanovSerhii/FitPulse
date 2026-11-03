import type { PlanTemplate, TemplateExercise } from '../model/types'

const ex = (exerciseId: string, sets: number, reps: number, restSeconds: number, notes?: string): TemplateExercise => ({
  exerciseId,
  sets,
  reps,
  restSeconds,
  ...(notes ? { notes } : {}),
})

const fullBodyA = [
  ex('ex-goblet-squat', 3, 12, 90),
  ex('ex-machine-chest-press', 3, 10, 90),
  ex('ex-lat-pulldown', 3, 10, 90),
  ex('ex-dumbbell-shoulder-press', 3, 10, 90),
  ex('ex-plank', 3, 45, 60, 'Секунди утримання'),
]

const fullBodyB = [
  ex('ex-leg-press', 3, 12, 90),
  ex('ex-dumbbell-bench-press', 3, 10, 90),
  ex('ex-seated-cable-row', 3, 10, 90),
  ex('ex-hyperextension', 3, 15, 60),
  ex('ex-cable-crunch', 3, 15, 60),
]

const strengthA = [
  ex('ex-barbell-squat', 5, 5, 180, 'Додавайте 2,5 кг щотренування, поки виходять усі повтори'),
  ex('ex-bench-press', 5, 5, 180),
  ex('ex-barbell-row', 5, 5, 150),
]

const strengthB = [
  ex('ex-barbell-squat', 5, 5, 180),
  ex('ex-overhead-press', 5, 5, 180),
  ex('ex-deadlift', 1, 5, 240, 'Один важкий робочий підхід після розминки'),
]

const push = [
  ex('ex-bench-press', 4, 6, 150, 'Основний жим'),
  ex('ex-incline-dumbbell-press', 3, 10, 90),
  ex('ex-dumbbell-shoulder-press', 3, 10, 90),
  ex('ex-cable-crossover', 3, 12, 60),
  ex('ex-lateral-raises', 4, 15, 60),
  ex('ex-cable-pushdown', 3, 12, 60),
]

const pull = [
  ex('ex-deadlift', 3, 5, 180),
  ex('ex-chin-ups', 4, 8, 120),
  ex('ex-seated-cable-row', 3, 10, 90),
  ex('ex-face-pull', 3, 15, 60),
  ex('ex-barbell-curl', 3, 10, 60),
  ex('ex-hammer-curl', 3, 12, 60),
]

const legs = [
  ex('ex-barbell-squat', 4, 6, 180),
  ex('ex-romanian-deadlift', 3, 10, 120),
  ex('ex-leg-press', 3, 12, 120),
  ex('ex-lying-leg-curl', 3, 12, 60),
  ex('ex-calf-raises', 4, 15, 60),
  ex('ex-hanging-leg-raise', 3, 12, 60),
]

const pushB = [
  ex('ex-overhead-press', 4, 6, 150, 'Основний жим'),
  ex('ex-incline-barbell-press', 3, 8, 120),
  ex('ex-dips', 3, 10, 90),
  ex('ex-pec-deck', 3, 12, 60),
  ex('ex-lateral-raises', 4, 15, 60),
  ex('ex-overhead-triceps-extension', 3, 12, 60),
]

const pullB = [
  ex('ex-barbell-row', 4, 8, 120),
  ex('ex-lat-pulldown', 3, 10, 90),
  ex('ex-one-arm-dumbbell-row', 3, 10, 60),
  ex('ex-rear-delt-fly', 3, 15, 60),
  ex('ex-barbell-shrug', 3, 12, 60),
  ex('ex-preacher-curl', 3, 10, 60),
]

const legsB = [
  ex('ex-front-squat', 4, 6, 180),
  ex('ex-hip-thrust', 3, 10, 90),
  ex('ex-split-squat', 3, 10, 90, 'Повтори на кожну ногу'),
  ex('ex-leg-extension', 3, 12, 60),
  ex('ex-seated-calf-raise', 4, 15, 60),
  ex('ex-cable-crunch', 3, 15, 60),
]

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'tpl-full-body-ab',
    name: 'Full Body A/B',
    description: 'Усе тіло за заняття, два тренування чергуються. Найкращий старт у залі: прості вправи, тренажери й робота над технікою.',
    goal: 'general',
    level: 'beginner',
    minutes: 50,
    schedule: { monday: fullBodyA, wednesday: fullBodyB, friday: fullBodyA },
  },
  {
    id: 'tpl-machines-start',
    name: 'Старт на тренажерах',
    description: 'Два заняття на тиждень лише на тренажерах і блоках: безпечна траєкторія, не потрібен страхувальник. Для перших місяців або повернення після перерви.',
    goal: 'general',
    level: 'beginner',
    minutes: 45,
    schedule: {
      monday: [
        ex('ex-leg-press', 3, 12, 90),
        ex('ex-machine-chest-press', 3, 12, 90),
        ex('ex-lat-pulldown', 3, 12, 90),
        ex('ex-lying-leg-curl', 3, 12, 60),
        ex('ex-machine-shoulder-press', 3, 12, 60),
        ex('ex-cable-crunch', 3, 15, 60),
      ],
      thursday: [
        ex('ex-hack-squat', 3, 12, 90),
        ex('ex-pec-deck', 3, 12, 60),
        ex('ex-seated-cable-row', 3, 12, 90),
        ex('ex-leg-extension', 3, 12, 60),
        ex('ex-cable-pushdown', 3, 12, 60),
        ex('ex-seated-calf-raise', 3, 15, 60),
      ],
    },
  },
  {
    id: 'tpl-dumbbells',
    name: 'Гантелі й лава',
    description: 'Три тренування на все тіло, для яких вистачить гантелей, лави й турніка. Підходить для невеликого залу або домашнього куточка.',
    goal: 'general',
    level: 'beginner',
    minutes: 50,
    schedule: {
      monday: [
        ex('ex-goblet-squat', 3, 12, 90),
        ex('ex-dumbbell-bench-press', 3, 10, 90),
        ex('ex-one-arm-dumbbell-row', 3, 10, 60),
        ex('ex-lateral-raises', 3, 15, 60),
        ex('ex-dumbbell-curl', 3, 12, 60),
      ],
      wednesday: [
        ex('ex-split-squat', 3, 10, 90, 'Повтори на кожну ногу'),
        ex('ex-dumbbell-shoulder-press', 3, 10, 90),
        ex('ex-chin-ups', 3, 6, 120),
        ex('ex-incline-dumbbell-fly', 3, 12, 60),
        ex('ex-russian-twist', 3, 20, 60),
      ],
      friday: [
        ex('ex-step-ups', 3, 10, 60, 'Повтори на кожну ногу'),
        ex('ex-incline-dumbbell-press', 3, 10, 90),
        ex('ex-rear-delt-fly', 3, 15, 60),
        ex('ex-hammer-curl', 3, 12, 60),
        ex('ex-plank', 3, 45, 60, 'Секунди утримання'),
      ],
    },
  },
  {
    id: 'tpl-strength-5x5',
    name: 'Сила 5×5',
    description: 'Три базові вправи за тренування, п’ять підходів по п’ять повторів. Вага росте щотижня, тож прогрес у присіді, жимі й тязі видно одразу.',
    goal: 'strength',
    level: 'beginner',
    minutes: 60,
    schedule: { monday: strengthA, wednesday: strengthB, friday: strengthA },
  },
  {
    id: 'tpl-ppl-3',
    name: 'Push / Pull / Legs на 3 дні',
    description: 'Класичний спліт: жимові м’язи, тягові м’язи й ноги, кожна група раз на тиждень. Великий обсяг за заняття й повне відновлення між ними.',
    goal: 'muscle',
    level: 'intermediate',
    minutes: 70,
    schedule: { monday: push, wednesday: pull, friday: legs },
  },
  {
    id: 'tpl-upper-lower',
    name: 'Верх / Низ на 4 дні',
    description: 'Кожна група м’язів двічі на тиждень: важкий день на силу й об’ємний день на масу. Збалансована програма для стабільного прогресу.',
    goal: 'muscle',
    level: 'intermediate',
    minutes: 65,
    schedule: {
      monday: [
        ex('ex-bench-press', 4, 6, 150),
        ex('ex-barbell-row', 4, 8, 120),
        ex('ex-overhead-press', 3, 8, 120),
        ex('ex-lat-pulldown', 3, 10, 90),
        ex('ex-barbell-curl', 3, 10, 60),
        ex('ex-cable-pushdown', 3, 12, 60),
      ],
      tuesday: [
        ex('ex-barbell-squat', 4, 6, 180),
        ex('ex-romanian-deadlift', 3, 10, 120),
        ex('ex-leg-press', 3, 12, 120),
        ex('ex-lying-leg-curl', 3, 12, 60),
        ex('ex-calf-raises', 4, 15, 60),
        ex('ex-hanging-leg-raise', 3, 12, 60),
      ],
      thursday: [
        ex('ex-incline-dumbbell-press', 4, 10, 90),
        ex('ex-one-arm-dumbbell-row', 3, 10, 60),
        ex('ex-dumbbell-shoulder-press', 3, 10, 90),
        ex('ex-chin-ups', 3, 8, 120),
        ex('ex-lateral-raises', 3, 15, 60),
        ex('ex-hammer-curl', 3, 12, 60),
        ex('ex-overhead-triceps-extension', 3, 12, 60),
      ],
      friday: [
        ex('ex-deadlift', 3, 5, 180),
        ex('ex-hack-squat', 3, 10, 120),
        ex('ex-split-squat', 3, 10, 90, 'Повтори на кожну ногу'),
        ex('ex-hip-thrust', 3, 10, 90),
        ex('ex-seated-calf-raise', 4, 15, 60),
        ex('ex-cable-crunch', 3, 15, 60),
      ],
    },
  },
  {
    id: 'tpl-glutes-legs',
    name: 'Акцент на сідниці й ноги',
    description: 'Два дні низу тіла з акцентом на сідниці та один легкий день верху. Для тих, хто хоче сильні ноги й підтягнуту форму.',
    goal: 'muscle',
    level: 'intermediate',
    minutes: 60,
    schedule: {
      monday: [
        ex('ex-hip-thrust', 4, 10, 120),
        ex('ex-romanian-deadlift', 3, 10, 120),
        ex('ex-split-squat', 3, 10, 90, 'Повтори на кожну ногу'),
        ex('ex-lying-leg-curl', 3, 12, 60),
        ex('ex-hyperextension', 3, 15, 60),
      ],
      wednesday: [
        ex('ex-dumbbell-bench-press', 3, 10, 90),
        ex('ex-lat-pulldown', 3, 10, 90),
        ex('ex-dumbbell-shoulder-press', 3, 10, 90),
        ex('ex-seated-cable-row', 3, 12, 60),
        ex('ex-face-pull', 3, 15, 60),
        ex('ex-plank', 3, 45, 60, 'Секунди утримання'),
      ],
      friday: [
        ex('ex-sumo-deadlift', 3, 6, 150),
        ex('ex-goblet-squat', 3, 12, 90),
        ex('ex-step-ups', 3, 10, 60, 'Повтори на кожну ногу'),
        ex('ex-kettlebell-swing', 3, 15, 60),
        ex('ex-leg-extension', 3, 15, 60),
        ex('ex-seated-calf-raise', 3, 15, 60),
      ],
    },
  },
  {
    id: 'tpl-fat-loss',
    name: 'Силові й кардіо для схуднення',
    description: 'Чотири дні: два силових кола на все тіло й два дні кардіо з пресом. Зберігає м’язи, поки ви худнете, і тренує витривалість.',
    goal: 'fatLoss',
    level: 'intermediate',
    minutes: 50,
    schedule: {
      monday: [
        ex('ex-goblet-squat', 3, 15, 45),
        ex('ex-dumbbell-bench-press', 3, 12, 45),
        ex('ex-seated-cable-row', 3, 12, 45),
        ex('ex-step-ups', 3, 12, 45, 'Повтори на кожну ногу'),
        ex('ex-kettlebell-swing', 3, 20, 45),
        ex('ex-rowing-machine', 1, 10, 60, 'Хвилини рівномірного темпу'),
      ],
      tuesday: [
        ex('ex-hiit-treadmill', 1, 20, 60, 'Хвилини з інтервалами'),
        ex('ex-cable-crunch', 3, 15, 45),
        ex('ex-russian-twist', 3, 20, 45),
        ex('ex-plank', 3, 45, 45, 'Секунди утримання'),
      ],
      thursday: [
        ex('ex-romanian-deadlift', 3, 12, 60),
        ex('ex-dumbbell-shoulder-press', 3, 12, 45),
        ex('ex-lat-pulldown', 3, 12, 45),
        ex('ex-split-squat', 3, 12, 45, 'Повтори на кожну ногу'),
        ex('ex-push-ups', 3, 15, 45),
        ex('ex-farmers-walk', 3, 40, 60, 'Секунди ходьби'),
      ],
      saturday: [
        ex('ex-rowing-machine', 1, 20, 60, 'Хвилини: 1 хв швидко, 1 хв легко'),
        ex('ex-hanging-leg-raise', 3, 12, 45),
        ex('ex-ab-roller', 3, 10, 45),
      ],
    },
  },
  {
    id: 'tpl-bro-split',
    name: 'Спліт на 5 днів',
    description: 'Окремий день для кожної групи м’язів: груди, спина, ноги, плечі й руки. Максимальний обсяг на групу для досвідчених.',
    goal: 'muscle',
    level: 'advanced',
    minutes: 60,
    schedule: {
      monday: [
        ex('ex-bench-press', 4, 8, 120),
        ex('ex-incline-dumbbell-press', 4, 10, 90),
        ex('ex-machine-chest-press', 3, 12, 90),
        ex('ex-cable-crossover', 3, 15, 60),
        ex('ex-dips', 3, 12, 90),
      ],
      tuesday: [
        ex('ex-deadlift', 3, 5, 180),
        ex('ex-pull-ups', 4, 8, 120),
        ex('ex-t-bar-row', 3, 10, 90),
        ex('ex-seated-cable-row', 3, 12, 60),
        ex('ex-straight-arm-pulldown', 3, 15, 60),
      ],
      wednesday: [
        ex('ex-barbell-squat', 4, 8, 180),
        ex('ex-leg-press', 4, 12, 120),
        ex('ex-romanian-deadlift', 3, 10, 120),
        ex('ex-leg-extension', 3, 15, 60),
        ex('ex-lying-leg-curl', 3, 12, 60),
        ex('ex-calf-raises', 4, 15, 60),
      ],
      thursday: [
        ex('ex-overhead-press', 4, 8, 120),
        ex('ex-arnold-press', 3, 10, 90),
        ex('ex-lateral-raises', 4, 15, 60),
        ex('ex-rear-delt-fly', 3, 15, 60),
        ex('ex-barbell-shrug', 3, 12, 60),
      ],
      friday: [
        ex('ex-close-grip-bench-press', 3, 8, 120),
        ex('ex-barbell-curl', 3, 10, 60),
        ex('ex-skull-crusher', 3, 10, 60),
        ex('ex-preacher-curl', 3, 12, 60),
        ex('ex-cable-pushdown', 3, 12, 60),
        ex('ex-hammer-curl', 3, 12, 60),
      ],
    },
  },
  {
    id: 'tpl-ppl-6',
    name: 'Push / Pull / Legs на 6 днів',
    description: 'Спліт двічі на тиждень з двома варіантами кожного дня. Великий обсяг і частота для досвідчених, яким вистачає часу на відновлення.',
    goal: 'muscle',
    level: 'advanced',
    minutes: 70,
    schedule: { monday: push, tuesday: pull, wednesday: legs, thursday: pushB, friday: pullB, saturday: legsB },
  },
]
