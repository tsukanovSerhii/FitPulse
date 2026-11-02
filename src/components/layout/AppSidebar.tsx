import { NavLink } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { ThemeToggle } from '@/components/ui'
import { AdSlot } from '@/features/ads/components/AdSlot'
import { cn } from '@/utils/cn'
import { Avatar } from './Avatar'
import { NAV_ITEMS } from './navigation'
import { WorkoutCta } from './WorkoutCta'
import { Wordmark } from './Wordmark'

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors duration-200',
    'before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-accent before:transition-opacity',
    isActive ? 'bg-surface-2 text-fg before:opacity-100' : 'text-fg-muted before:opacity-0 hover:bg-surface-2 hover:text-fg',
  )

export function AppSidebar() {
  const user = useAppSelector((state) => state.auth.user)

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-20 items-center px-6">
        <Wordmark />
      </div>

      <div className="px-4">
        <WorkoutCta className="h-11 w-full" />
      </div>

      <nav aria-label="Основна навігація" className="mt-6 flex-1 px-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink to={item.path} end={item.path === '/'} className={linkClasses}>
                  <Icon className="size-[18px]" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-4 border-t border-line p-4">
        <AdSlot placement="sidebar" />
        <ThemeToggle className="w-full [&>button]:flex-1" />
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface-2',
              isActive && 'bg-surface-2',
            )
          }
        >
          <Avatar seed={user?.avatarSeed ?? 'guest'} name={user?.name} className="size-9" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-fg">{user?.name || 'Атлет'}</span>
            <span className="block text-xs text-fg-subtle">Профіль</span>
          </span>
          <ChevronRight className="size-4 text-fg-subtle" aria-hidden="true" />
        </NavLink>
      </div>
    </aside>
  )
}
