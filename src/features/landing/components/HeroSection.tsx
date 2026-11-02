import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { buttonClasses } from '@/components/ui'
import { PhoneMockup } from './PhoneMockup'

const FACTS = [
  { value: '18+', label: 'вправ з технікою' },
  { value: '0 ₴', label: 'щоб почати' },
  { value: '1', label: 'кнопка на підхід' },
]

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-24">
      <div>
        <p className="flex items-baseline gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="font-mono text-accent">/ 01</span>
          <span className="text-fg-subtle">Трекер силових тренувань</span>
        </p>
        <h1 className="mt-6 text-6xl leading-[1.04] text-fg sm:text-7xl lg:text-8xl">
          Тренуйся
          <br />
          за планом.
          <br />
          <span className="text-accent">Бач прогрес.</span>
        </h1>
        <p className="mt-6 max-w-lg text-base text-fg-muted sm:text-lg">
          FitPulse веде тебе через тренування в залі: що робити, з якою вагою і скільки відпочивати. Без зайвого — лише план,
          техніка й цифри.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register" className={buttonClasses('primary', 'lg')}>
            Почати безкоштовно <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a href="#features" className={buttonClasses('outline', 'lg')}>
            Дізнатися більше
          </a>
        </div>
        <dl className="mt-12 grid max-w-md grid-cols-3 border-t border-line pt-6">
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <dt className="sr-only">{fact.label}</dt>
              <dd className="font-mono text-2xl font-semibold text-fg tabular">{fact.value}</dd>
              <dd className="mt-1 text-xs text-fg-subtle">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </div>
      <PhoneMockup />
    </section>
  )
}
