import { Link, NavLink } from 'react-router-dom'
import { ThemeCycleButton } from '@/components/ui'
import { cn } from '@/utils/cn'
import { NAV_ITEMS } from './navigation'
import { WorkoutCta } from './WorkoutCta'

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('font-display text-2xl font-semibold uppercase leading-none tracking-tight text-fg', className)}>
      Fit<span className="text-accent">Pulse</span>
    </Link>
  )
}

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:h-20 lg:px-12">
        <Wordmark />

        <nav aria-label="Основна навігація" className="hidden h-full items-stretch gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center text-sm font-semibold transition-colors duration-200',
                  'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-300',
                  isActive ? 'text-accent after:scale-x-100' : 'text-fg-muted after:scale-x-0 hover:text-fg',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WorkoutCta />
          {/* На десктопі перемикач теми живе в бічній панелі */}
          <ThemeCycleButton className="lg:hidden" />
        </div>
      </div>
    </header>
  )
}
