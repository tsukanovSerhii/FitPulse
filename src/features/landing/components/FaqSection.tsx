import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { FAQ } from '../faq'
import { SectionEyebrow } from './SectionHeader'

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const baseId = useId()

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20 lg:py-32">
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <SectionEyebrow index={5} label="Питання" />
          <h2 id="faq-title" className="text-5xl leading-[1.05] text-fg sm:text-6xl">
            Часті запитання
          </h2>
          <p className="max-w-md text-lg text-fg-muted">Ціна, збереження даних і те, як FitPulse допомагає під час тренування.</p>
        </div>

        <ul className="space-y-3">
          {FAQ.map((item, i) => {
            const isOpen = openIndex === i
            const buttonId = `${baseId}-q${i}`
            const panelId = `${baseId}-a${i}`
            return (
              <li
                key={item.question}
                className={cn(
                  'rounded-lg border transition-colors',
                  isOpen ? 'border-line-strong bg-surface' : 'border-line hover:border-line-strong',
                )}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center gap-5 px-5 py-5 text-left sm:px-6"
                  >
                    <span className={cn('font-mono text-sm transition-colors', isOpen ? 'text-accent' : 'text-fg-subtle')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 font-sans text-lg font-semibold normal-case tracking-normal text-fg sm:text-xl">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn('size-5 shrink-0 text-fg-muted transition-transform duration-300', isOpen && 'rotate-180 text-accent')}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                {/* grid-rows 0fr -> 1fr animates the panel to its natural height */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p className="px-5 pb-6 text-base leading-relaxed text-fg-muted sm:pl-[3.75rem] sm:pr-6">{item.answer}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
