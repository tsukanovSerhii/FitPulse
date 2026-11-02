import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Wordmark } from '@/components/layout/Wordmark'
import { ThemeCycleButton } from '@/components/ui'
import { PHOTOS } from '@/data/photos'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-bg text-fg lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <header className="flex items-center justify-between">
          <Wordmark />
          <ThemeCycleButton />
        </header>

        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <Link to="/welcome" className="mb-8 inline-flex items-center gap-1.5 text-sm text-fg-subtle hover:text-fg">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Про FitPulse
          </Link>
          <h1 className="text-4xl text-fg sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-fg-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden lg:block" aria-hidden="true">
        <img src={PHOTOS.runnerShoreline.src} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-scrim/90 via-scrim/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-4 p-12 text-on-photo">
          <div className="h-px w-24 bg-accent" />
          <p className="font-display text-5xl uppercase leading-[1.05]">
            Кожен підхід
            <br />
            має значення
          </p>
          <p className="max-w-sm text-sm text-on-photo/70">План, техніка й прогрес — в одному місці, завжди під рукою в залі.</p>
        </div>
      </aside>
    </div>
  )
}
