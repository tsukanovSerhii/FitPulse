import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { AnatomyVisual, ProgressVisual, RestVisual, StepperVisual, WeekVisual } from './FeatureVisuals'
import { SectionHeader } from './SectionHeader'

interface Feature {
  title: string
  text: string
  points: string[]
  visual: ReactNode
  wide?: boolean
}

const FEATURES: Feature[] = [
  {
    title: 'Техніка кожної вправи',
    text: 'Розбір руху крок за кроком: що працює, як тримати корпус і де найчастіше помиляються.',
    points: [
      'Анімація чотирьох фаз руху',
      'Анатомічна карта основних і допоміжних м’язів',
      'Типові помилки та поради для новачків',
      'Фільтри за м’язами, обладнанням і рівнем',
    ],
    visual: <AnatomyVisual />,
    wide: true,
  },
  {
    title: 'Режим тренування',
    text: 'Екран під одну руку: усе потрібне для підходу видно без прокрутки.',
    points: ['Вага й повтори кнопками ±', 'Підхід записується одним дотиком', 'Екран не гасне під час сесії'],
    visual: <StepperVisual />,
  },
  {
    title: 'Таймер відпочинку',
    text: 'Стартує сам після кожного підходу, тож пауза завжди потрібної довжини.',
    points: ['Вібрація і звук наприкінці', 'Можна додати або пропустити час'],
    visual: <RestVisual />,
  },
  {
    title: 'Програми на тиждень',
    text: 'Готові спліти або власний розклад на кожен день.',
    points: ['Push / Pull / Legs і Full Body', 'Пошук серед програм і вправ'],
    visual: <WeekVisual />,
  },
  {
    title: 'Прогрес і рекорди',
    text: 'Статистика рахується сама після кожного тренування.',
    points: ['Тоннаж і журнал сесій', 'Особисті рекорди за вправами'],
    visual: <ProgressVisual />,
  },
]

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <li
      className={cn(
        'group flex flex-col gap-8 rounded-lg border border-line bg-surface p-6 transition-colors hover:border-line-strong sm:p-8',
        feature.wide && 'md:col-span-2 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12',
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-accent">{String(index + 1).padStart(2, '0')}</span>
          <span className="h-px flex-1 bg-line transition-colors group-hover:bg-accent/40" aria-hidden="true" />
        </div>
        <h3 className="text-3xl leading-tight text-fg">{feature.title}</h3>
        <p className="text-base text-fg-muted">{feature.text}</p>
        <ul className="space-y-2 pt-1">
          {feature.points.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-fg">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className={cn('flex justify-center', !feature.wide && 'mt-auto')}>{feature.visual}</div>
    </li>
  )
}

export function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl space-y-14 px-5 py-24 sm:px-8 lg:py-32">
        <SectionHeader
          id="features-title"
          index={2}
          label="Можливості"
          title="Все для тренування — в одному місці"
          lead="Від вибору вправи до запису рекорду: FitPulse закриває весь шлях тренування в залі."
        />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
