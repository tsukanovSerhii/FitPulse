import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { buttonClasses } from '@/shared/ui'
import { PHOTOS } from '@/shared/config/photos'

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden">
      <img src={PHOTOS.runnerShoreline.src} alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-scrim/90 via-scrim/70 to-scrim/30" />
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center gap-10 px-5 py-24 text-on-photo sm:px-8">
        <h2 id="cta-title" className="max-w-4xl text-6xl leading-[1.02] sm:text-7xl lg:text-8xl">
          Наступне тренування
          <br />
          <span className="text-accent">вже сьогодні</span>
        </h2>
        <p className="max-w-xl text-lg text-on-photo/75 sm:text-xl">Створіть акаунт за хвилину й відкрийте FitPulse у залі.</p>
        <Link to="/register" className={buttonClasses('primary', 'lg', 'h-14 w-fit px-8 text-base')}>
          Створити акаунт <ArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
