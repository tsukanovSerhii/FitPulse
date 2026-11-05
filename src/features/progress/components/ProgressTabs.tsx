import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

const TABS = [
  { to: '/progress', label: 'Огляд' },
  { to: '/progress/journal', label: 'Журнал' },
  { to: '/progress/body', label: 'Тіло' },
]

/** Route-backed tabs: each tab is a page, so the browser history and links work as expected. */
export function ProgressTabs() {
  return (
    <nav aria-label="Розділи прогресу" className="flex gap-6 border-b border-line">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) =>
            cn(
              '-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors',
              isActive ? 'border-accent text-fg' : 'border-transparent text-fg-muted hover:text-fg',
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
