import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { MobileTabBar } from './MobileTabBar'
import { SideRail } from './SideRail'
import { Topbar } from './Topbar'

export function MainLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <SideRail />

      <div className="flex min-w-0 flex-1 flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          Перейти до змісту
        </a>
        <Topbar />

        <main id="main" className="mx-auto w-full max-w-7xl flex-1 animate-fade-in px-5 py-8 pb-24 sm:px-8 md:pb-12 lg:px-12 lg:py-12">
          <Outlet />
        </main>

        <Footer />
        {/* Відступ під мобільний таб-бар */}
        <div className="h-16 md:hidden" aria-hidden="true" />
      </div>

      <MobileTabBar />
    </div>
  )
}
