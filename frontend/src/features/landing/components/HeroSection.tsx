import { Link } from 'react-router-dom'
import { ArrowRight, Check, Trophy } from 'lucide-react'
import { ProgressRing, buttonClasses } from '@/shared/ui'
import { PhoneMockup } from './PhoneMockup'

const PERKS = ['Без картки', 'Працює в браузері телефона', 'Світла й темна тема']

function FloatingCards() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute -left-6 bottom-28 hidden w-44 -rotate-6 rounded-lg border border-line bg-surface p-4 shadow-pop sm:block lg:-left-28"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Відпочинок</p>
        <div className="mt-3 flex justify-center">
          <ProgressRing value={62} label="" size={96} stroke={4}>
            <span className="font-mono text-xl font-semibold text-fg">0:56</span>
          </ProgressRing>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute -right-4 -top-6 hidden w-52 rotate-3 rounded-lg border border-line bg-surface p-4 shadow-pop sm:block lg:-right-20"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Trophy className="size-5" />
          </span>
          <div>
            <p className="text-xs text-fg-subtle">Новий рекорд</p>
            <p className="font-mono text-lg font-semibold text-fg">105 кг × 6</p>
          </div>
        </div>
      </div>
    </>
  )
}

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      <div aria-hidden="true" className="absolute -top-40 right-0 -z-10 size-[560px] rounded-full bg-accent/15 blur-[120px]" />

      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-16 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div>
          <h1 className="text-6xl leading-[0.98] text-fg sm:text-7xl xl:text-8xl">
            Тренування за планом.
            <br />
            <span className="text-accent">Прогрес у цифрах.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-fg-muted sm:text-xl">
            FitPulse веде вас через кожне тренування в залі: яку вправу робити, з якою вагою і скільки відпочивати. Програма на
            тиждень, техніка вправ і рекорди — в одному застосунку на телефоні.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/register" className={buttonClasses('primary', 'lg', 'h-14 px-8 text-base')}>
              Почати безкоштовно <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <a href="#features" className={buttonClasses('outline', 'lg', 'h-14 px-8 text-base')}>
              Можливості
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-muted">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <Check className="size-4 text-accent" aria-hidden="true" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto">
          <PhoneMockup />
          <FloatingCards />
        </div>
      </div>
    </section>
  )
}
