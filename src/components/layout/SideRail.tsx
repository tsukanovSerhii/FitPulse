import { Link } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { ThemeCycleButton } from '@/components/ui'

/** Вузька вертикальна панель зліва (desktop) — композиційний елемент з референсу. */
export function SideRail() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col items-center justify-between border-r border-line bg-surface py-6 lg:flex">
      <Link
        to="/"
        aria-label="FitPulse — на головну"
        className="flex size-11 items-center justify-center rounded-md bg-accent font-display text-xl font-semibold text-on-accent"
      >
        F
      </Link>

      <p
        className="select-none text-[11px] font-semibold uppercase tracking-[0.4em] text-fg-subtle [writing-mode:vertical-rl] rotate-180"
        aria-hidden="true"
      >
        Train · Track · Repeat
      </p>

      <div className="flex flex-col items-center gap-2">
        <ThemeCycleButton />
        <Link
          to="/profile"
          aria-label="Профіль"
          title="Профіль"
          className="flex size-11 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <UserRound className="size-5" />
        </Link>
      </div>
    </aside>
  )
}
