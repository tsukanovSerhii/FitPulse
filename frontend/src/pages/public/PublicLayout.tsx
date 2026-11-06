import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAppSelector } from '@/app/store/hooks'
import { Footer } from '@/app/layout/Footer'
import { ThemeCycleButton } from '@/features/theme'
import { buttonClasses, Wordmark } from '@/shared/ui'
import { CATALOG_PATH } from './content'

export interface Crumb {
  label: string
  to?: string
}

/** Frame of the public catalog: open to everyone and to search engines, with a way into the app. */
export function PublicLayout({ crumbs = [], children }: { crumbs?: Crumb[]; children: ReactNode }) {
  const signedIn = useAppSelector((state) => Boolean(state.auth.user))

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link to="/welcome" aria-label="FitPulse — на головну">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-2">
            <Link to={CATALOG_PATH} className="hidden text-sm font-semibold text-fg-muted hover:text-fg sm:inline">
              Каталог
            </Link>
            <ThemeCycleButton />
            <Link to={signedIn ? '/' : '/register'} className={buttonClasses('primary', 'sm')}>
              {signedIn ? 'До застосунку' : 'Почати безкоштовно'}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        {crumbs.length > 0 && (
          <nav aria-label="Навігація" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-fg-muted">
              {crumbs.map((crumb, i) => (
                <li key={crumb.label} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3.5 text-fg-subtle" aria-hidden="true" />}
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-fg">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-fg">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {children}
      </main>

      <Footer />
    </div>
  )
}

/** Call to action at the end of a public page. */
export function StartCta({ title, text }: { title: string; text: string }) {
  const signedIn = useAppSelector((state) => Boolean(state.auth.user))
  return (
    <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
      <h2 className="font-sans text-lg font-semibold normal-case tracking-normal text-fg">{title}</h2>
      <p className="mt-1 text-sm text-fg-muted">{text}</p>
      <Link to={signedIn ? '/workout' : '/register'} className={buttonClasses('primary', 'md', 'mt-4')}>
        {signedIn ? 'Почати тренування' : 'Створити акаунт безкоштовно'}
      </Link>
    </section>
  )
}
