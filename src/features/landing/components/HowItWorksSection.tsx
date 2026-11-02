import { PHOTOS } from '@/shared/config/photos'
import { SectionHeader } from './SectionHeader'

const STEPS = [
  { title: 'Створіть акаунт', text: 'Безкоштовно, за хвилину. Потрібні лише ім’я та email.' },
  { title: 'Оберіть програму', text: 'Візьміть готовий спліт або зберіть свій тиждень із каталогу вправ.' },
  { title: 'Тренуйтеся', text: 'Відкрийте FitPulse у залі й відмічайте підходи однією кнопкою.' },
]

export function HowItWorksSection() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-7xl space-y-14 px-5 py-24 sm:px-8 lg:py-32">
        <SectionHeader id="how-title" index={3} label="Як це працює" title="Три кроки до першого тренування" />
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <ol className="space-y-10">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-8 border-b border-line pb-10 last:border-0 last:pb-0">
                <span className="font-display text-7xl leading-none text-accent sm:text-8xl">{i + 1}</span>
                <div className="space-y-2 pt-2">
                  <h3 className="text-3xl text-fg sm:text-4xl">{step.title}</h3>
                  <p className="text-base text-fg-muted sm:text-lg">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-[4/5]">
            <img src={PHOTOS.deadlift.src} alt={PHOTOS.deadlift.alt} loading="lazy" className="absolute inset-0 size-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}
