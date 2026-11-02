import { NavLink } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useAppSelector } from '../store/hooks'
import { formatDuration } from '@/shared/lib/formatters'
import { cn } from '@/shared/lib/cn'
import { NAV_ITEMS, type NavItem } from './navigation'

function TabLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        cn(
          'flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors',
          isActive ? 'text-accent' : 'text-fg-subtle',
        )
      }
    >
      <Icon className="size-5" aria-hidden="true" />
      {item.label}
    </NavLink>
  )
}

export function MobileTabBar() {
  const session = useAppSelector((state) => state.workoutSession)
  const [home, exercises, plans, progress] = NAV_ITEMS

  return (
    <nav
      aria-label="Основна навігація"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 items-center">
        <li>
          <TabLink item={home} />
        </li>
        <li>
          <TabLink item={exercises} />
        </li>
        <li className="flex justify-center">
          <NavLink
            to="/workout"
            aria-label={session.isActive ? `Тренування триває, ${formatDuration(session.elapsedSeconds)}` : 'Тренування'}
            className={({ isActive }) =>
              cn(
                '-mt-6 flex size-16 flex-col items-center justify-center rounded-full border-4 border-bg bg-accent text-on-accent shadow-pop transition-transform active:scale-95',
                isActive && 'ring-2 ring-accent/40',
              )
            }
          >
            {session.isActive ? (
              <span className="font-mono text-xs font-semibold tabular">{formatDuration(session.elapsedSeconds)}</span>
            ) : (
              <Play className="size-6 translate-x-0.5 fill-current" aria-hidden="true" />
            )}
          </NavLink>
        </li>
        <li>
          <TabLink item={plans} />
        </li>
        <li>
          <TabLink item={progress} />
        </li>
      </ul>
    </nav>
  )
}
