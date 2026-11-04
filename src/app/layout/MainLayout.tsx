import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary, ErrorScreen } from '@/shared/ui'
import { useSessionClock } from '@/features/workoutSession/model'
import { AppSidebar } from './AppSidebar'
import { Footer } from './Footer'
import { MobileHeader } from './MobileHeader'
import { MobileTabBar } from './MobileTabBar'
import { PageSkeleton } from './PageSkeleton'

export function MainLayout() {
  const { pathname } = useLocation()
  useSessionClock()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Перейти до змісту
      </a>

      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 animate-fade-in px-5 py-6 sm:px-8 lg:px-12 lg:py-12">
          {/* A crash inside a page keeps the navigation usable; moving to another route clears it */}
          <ErrorBoundary resetKey={pathname} fallback={({ error, reset }) => <ErrorScreen error={error} onRetry={reset} />}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>

        <Footer />
        <div className="h-20 lg:hidden" aria-hidden="true" />
      </div>

      <MobileTabBar />
    </div>
  )
}
