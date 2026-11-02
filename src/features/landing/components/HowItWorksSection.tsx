import { SectionLabel } from '@/components/ui'
import { PHOTOS } from '@/data/photos'

const STEPS = [
  { title: 'Створіть акаунт', text: 'Безкоштовно, за хвилину. Аватарка згенерується сама.' },
  { title: 'Оберіть програму', text: 'Візьміть готовий спліт або зберіть свій тиждень із каталогу вправ.' },
  { title: 'Тренуйтеся', text: 'Відкрийте FitPulse у залі й відмічайте підходи однією кнопкою.' },
]

export function HowItWorksSection() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
        <div className="space-y-10">
          <SectionLabel index={3}>Як це працює</SectionLabel>
          <ol className="space-y-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-6">
                <span className="font-display text-5xl leading-none text-accent">{i + 1}</span>
                <div className="space-y-1 pt-1">
                  <h3 className="font-sans text-lg font-semibold normal-case tracking-normal text-fg">{step.title}</h3>
                  <p className="text-sm text-fg-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-lg">
          <img src={PHOTOS.deadlift.src} alt={PHOTOS.deadlift.alt} loading="lazy" className="absolute inset-0 size-full object-cover" />
        </div>
      </div>
    </section>
  )
}
