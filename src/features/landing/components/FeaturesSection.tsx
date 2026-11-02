import { Calendar, Dumbbell, Timer, TrendingUp, type LucideIcon } from 'lucide-react'
import { SectionLabel } from '@/components/ui'

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Dumbbell,
    title: 'Техніка кожної вправи',
    text: 'Фази руху, анатомічна карта м’язів, типові помилки й поради для новачків і досвідчених.',
  },
  {
    icon: Calendar,
    title: 'Програми й розклад',
    text: 'Готові спліти Push / Pull / Legs і Full Body або власна програма на тиждень.',
  },
  {
    icon: Timer,
    title: 'Режим тренування',
    text: 'Великі кнопки під палець, таймер відпочинку з вібрацією, екран не гасне в залі.',
  },
  {
    icon: TrendingUp,
    title: 'Прогрес і рекорди',
    text: 'Журнал сесій, тоннаж, час у залі та автоматичний облік особистих рекордів.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl space-y-12 px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <SectionLabel index={2}>Можливості</SectionLabel>
          <h2 className="text-4xl leading-[1.08] text-fg sm:text-5xl">Все для тренування — в одному місці</h2>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="space-y-4 bg-surface p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-accent" aria-hidden="true" />
                <span className="font-mono text-xs text-fg-subtle">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="font-sans text-lg font-semibold normal-case tracking-normal text-fg">{title}</h3>
              <p className="text-sm text-fg-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
