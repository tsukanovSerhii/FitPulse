import { Plus } from 'lucide-react'
import { FAQ } from '../faq'
import { SectionHeader } from './SectionHeader'

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-7xl space-y-14 px-5 py-24 sm:px-8 lg:py-32">
        <SectionHeader id="faq-title" index={5} label="Питання" title="Часті запитання" />
        <div className="divide-y divide-line border-y border-line lg:ml-[calc((100%-1.5rem)*0.385+1.5rem)]">
          {FAQ.map((item) => (
            <details key={item.question} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-semibold text-fg sm:text-2xl [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus className="size-6 shrink-0 text-accent transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
