import { useId, type ReactNode } from 'react'

export function DashboardSection({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 id={id} className="font-sans text-xs font-bold tracking-[0.16em] text-fg-muted">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
