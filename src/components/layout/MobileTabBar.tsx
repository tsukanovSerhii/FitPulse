import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { NAV_ITEMS } from './navigation'

/** Нижня навігація для екранів < md. */
export function MobileTabBar() {
  return (
    <nav
      aria-label="Основна навігація"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                    'before:absolute before:inset-x-5 before:top-0 before:h-0.5 before:bg-accent before:transition-opacity',
                    isActive ? 'text-accent before:opacity-100' : 'text-fg-subtle before:opacity-0',
                  )
                }
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
