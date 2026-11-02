import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import { buttonClasses } from '@/components/ui'
import { FAQ } from '../faq'
import { SectionEyebrow } from './SectionHeader'

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:py-32">
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <SectionEyebrow index={5} label="Питання" />
          <h2 id="faq-title" className="text-5xl leading-[1.05] text-fg sm:text-6xl">
            Часті запитання
          </h2>
          <p className="max-w-md text-lg text-fg-muted">
            Коротко про ціну, дані та те, як FitPulse працює в залі. Решту простіше перевірити самому: старт займає хвилину.
          </p>
          <Link to="/register" className={buttonClasses('outline', 'lg', 'h-12 px-6')}>
            Створити акаунт <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="divide-y divide-line border-y border-line">
          {FAQ.map((item, i) => (
            <details key={item.question} className="group py-6" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-5 text-xl font-semibold text-fg transition-colors hover:text-accent sm:text-2xl [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-sm text-fg-subtle">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">{item.question}</span>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line transition-colors group-open:border-accent">
                  <Plus className="size-5 text-accent transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
                </span>
              </summary>
              <p className="mt-4 max-w-2xl pl-10 text-base leading-relaxed text-fg-muted sm:text-lg">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
