import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { AnatomyVisual, ProgressVisual, RestVisual, StepperVisual, WeekVisual } from './FeatureVisuals'
import { SectionHeader } from './SectionHeader'

interface Feature {
  title: string
  text: string
  visual: ReactNode
  className: string
}

const FEATURES: Feature[] = [
  {
    title: 'Техніка кожної вправи',
    text: 'Анімація фаз руху, анатомічна карта м’язів, типові помилки й поради для новачків і досвідчених. Ви знаєте, що робите і навіщо.',
    visual: <AnatomyVisual />,
    className: 'lg:col-span-4 lg:row-span-2',
  },
  {
    title: 'Режим тренування',
    text: 'Великі кнопки під палець: вага, повтори, підхід — без клавіатури.',
    visual: <StepperVisual />,
    className: 'lg:col-span-2',
  },
  {
    title: 'Таймер відпочинку',
    text: 'Запускається сам після підходу, з вібрацією і звуком.',
    visual: <RestVisual />,
    className: 'lg:col-span-2',
  },
  {
    title: 'Програми на тиждень',
    text: 'Готові спліти Push / Pull / Legs і Full Body або власна програма тренувань.',
    visual: <WeekVisual />,
    className: 'lg:col-span-3',
  },
  {
    title: 'Прогрес і рекорди',
    text: 'Тоннаж, журнал сесій і особисті рекорди рахуються автоматично.',
    visual: <ProgressVisual />,
    className: 'lg:col-span-3',
  },
]

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
        <ul className="grid gap-4 lg:grid-cols-6">
          {FEATURES.map((feature, i) => (
            <li
              key={feature.title}
              className={cn(
                'flex flex-col justify-between gap-10 rounded-lg border border-line bg-surface p-6 transition-colors hover:border-line-strong sm:p-8',
                feature.className,
              )}
            >
              <div className="space-y-3">
                <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-3xl leading-tight text-fg sm:text-4xl">{feature.title}</h3>
                <p className="max-w-xl text-base text-fg-muted sm:text-lg">{feature.text}</p>
              </div>
              <div className={cn('flex', i === 0 && 'flex-1 items-center')}>{feature.visual}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
