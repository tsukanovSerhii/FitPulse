import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Footer } from '@/app/layout/Footer'
import { ThemeCycleButton } from '@/features/theme'
import { Wordmark } from '@/shared/ui'

export const CONTACT_URL = 'https://github.com/tsukanovSerhii/FitPulse/issues'
export const UPDATED_AT = '3 листопада 2026'
/** Inline links are underlined: color alone does not mark a link inside running text. */
export const TEXT_LINK = 'text-accent underline underline-offset-2 hover:text-accent-hover'

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-sans text-xl font-semibold normal-case tracking-normal text-fg">{title}</h2>
      <div className="space-y-3 text-base leading-relaxed text-fg-muted [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">{children}</div>
    </section>
  )
}

export function LegalLayout({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link to="/welcome" aria-label="FitPulse — на головну">
            <Wordmark />
          </Link>
          <ThemeCycleButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <Link to="/welcome" className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden="true" />
          На головну
        </Link>
        <h1 className="mt-6 text-4xl leading-[1.08] text-fg sm:text-5xl">{title}</h1>
        <p className="mt-4 text-lg text-fg-muted">{lead}</p>
        <p className="mt-2 text-sm text-fg-subtle">Оновлено {UPDATED_AT}</p>
        <div className="mt-10 space-y-10">{children}</div>
      </main>

      <Footer />
    </div>
  )
}
