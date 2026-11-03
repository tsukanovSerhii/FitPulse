/**
 * One movement done with different equipment or grips. The catalog shows each group as one card
 * with a switcher; every variant stays a separate exercise, so plans and history keep their ids.
 */
export interface VariantGroup {
  id: string
  name: string
  variants: [exerciseId: string, label: string][]
}

export const VARIANT_GROUPS: VariantGroup[] = [
  {
    id: 'bench-press',
    name: 'Жим лежачи',
    variants: [
      ['ex-bench-press', 'Штанга'],
      ['ex-dumbbell-bench-press', 'Гантелі'],
      ['ex-smith-bench-press', 'Сміт'],
      ['ex-machine-chest-press', 'Тренажер'],
    ],
  },
  {
    id: 'incline-press',
    name: 'Жим на похилій лаві',
    variants: [
      ['ex-incline-barbell-press', 'Штанга'],
      ['ex-incline-dumbbell-press', 'Гантелі'],
      ['ex-smith-incline-press', 'Сміт'],
    ],
  },
  {
    id: 'chest-fly',
    name: 'Зведення рук на груди',
    variants: [
      ['ex-cable-crossover', 'Кросовер'],
      ['ex-low-cable-crossover', 'Нижні блоки'],
      ['ex-pec-deck', 'Тренажер'],
      ['ex-dumbbell-fly', 'Гантелі'],
      ['ex-incline-dumbbell-fly', 'Похила лава'],
    ],
  },
  {
    id: 'overhead-press',
    name: 'Жим над головою',
    variants: [
      ['ex-overhead-press', 'Штанга стоячи'],
      ['ex-seated-barbell-press', 'Штанга сидячи'],
      ['ex-dumbbell-shoulder-press', 'Гантелі'],
      ['ex-arnold-press', 'Арнольд'],
      ['ex-machine-shoulder-press', 'Тренажер'],
    ],
  },
  {
    id: 'squat',
    name: 'Присідання',
    variants: [
      ['ex-barbell-squat', 'Штанга'],
      ['ex-front-squat', 'Фронтальні'],
      ['ex-smith-squat', 'Сміт'],
      ['ex-hack-squat', 'Гак-тренажер'],
      ['ex-goblet-squat', 'Гиря'],
    ],
  },
  {
    id: 'deadlift',
    name: 'Станова тяга',
    variants: [
      ['ex-deadlift', 'Класична'],
      ['ex-sumo-deadlift', 'Сумо'],
      ['ex-trap-bar-deadlift', 'Трап-гриф'],
      ['ex-rack-pull', 'З плінтів'],
    ],
  },
  {
    id: 'bent-row',
    name: 'Тяга в нахилі',
    variants: [
      ['ex-barbell-row', 'Штанга'],
      ['ex-reverse-grip-row', 'Зворотний хват'],
      ['ex-two-dumbbell-row', 'Гантелі'],
      ['ex-one-arm-dumbbell-row', 'Одна гантеля'],
      ['ex-t-bar-row', 'Т-гриф'],
    ],
  },
  {
    id: 'pulldown',
    name: 'Тяга верхнього блока',
    variants: [
      ['ex-lat-pulldown', 'Широкий хват'],
      ['ex-close-grip-pulldown', 'Вузький хват'],
    ],
  },
  {
    id: 'pull-up',
    name: 'Підтягування',
    variants: [
      ['ex-pull-ups', 'Широкий хват'],
      ['ex-chin-ups', 'Зворотний хват'],
    ],
  },
  {
    id: 'lunge',
    name: 'Випади',
    variants: [
      ['ex-dumbbell-lunges', 'Гантелі'],
      ['ex-barbell-lunge', 'Штанга'],
      ['ex-walking-lunge', 'У ходьбі'],
      ['ex-split-squat', 'Розщеплені'],
    ],
  },
  {
    id: 'leg-curl',
    name: 'Згинання ніг',
    variants: [
      ['ex-lying-leg-curl', 'Лежачи'],
      ['ex-seated-leg-curl', 'Сидячи'],
    ],
  },
  {
    id: 'calf-raise',
    name: 'Підйом на носки',
    variants: [
      ['ex-calf-raises', 'Стоячи'],
      ['ex-seated-calf-raise', 'Сидячи'],
      ['ex-leg-press-calf-raise', 'У жимі ногами'],
    ],
  },
  {
    id: 'glute-bridge',
    name: 'Ягідний місток',
    variants: [
      ['ex-hip-thrust', 'З лавою'],
      ['ex-glute-bridge', 'З підлоги'],
    ],
  },
  {
    id: 'lateral-raise',
    name: 'Махи в сторони',
    variants: [
      ['ex-lateral-raises', 'Гантелі'],
      ['ex-cable-lateral-raise', 'Блок'],
    ],
  },
  {
    id: 'rear-delt',
    name: 'Розведення на задню дельту',
    variants: [
      ['ex-rear-delt-fly', 'Гантелі'],
      ['ex-reverse-pec-deck', 'Тренажер'],
    ],
  },
  {
    id: 'shrug',
    name: 'Шраги',
    variants: [
      ['ex-barbell-shrug', 'Штанга'],
      ['ex-dumbbell-shrug', 'Гантелі'],
    ],
  },
  {
    id: 'biceps-curl',
    name: 'Згинання на біцепс стоячи',
    variants: [
      ['ex-barbell-curl', 'Штанга'],
      ['ex-ez-bar-curl', 'EZ-гриф'],
      ['ex-dumbbell-curl', 'Гантелі'],
      ['ex-cable-curl', 'Блок'],
    ],
  },
  {
    id: 'pushdown',
    name: 'Розгинання рук на блоці',
    variants: [
      ['ex-cable-pushdown', 'Пряма рукоять'],
      ['ex-rope-pushdown', 'Канат'],
    ],
  },
]
