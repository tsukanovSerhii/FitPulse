import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Divider({ vertical = false, className }: { vertical?: boolean; className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      className={cn('shrink-0 bg-line', vertical ? 'w-px self-stretch' : 'h-px w-full', className)}
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-surface-2', className)} aria-hidden="true" />
}

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-line-strong px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="mb-4 text-fg-subtle [&_svg]:size-8">{icon}</div>}
      <h3 className="text-lg text-fg">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/** Заголовок сторінки: «/ 01» + великий display-заголовок + опис + дії праворуч. */
export function PageHeader({
  index,
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  index?: number
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {(index !== undefined || eyebrow) && (
          <div className="mb-4 flex items-baseline gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
            {index !== undefined && <span className="font-mono text-accent">/ {String(index).padStart(2, '0')}</span>}
            {eyebrow && <span className="text-fg-subtle">{eyebrow}</span>}
          </div>
        )}
        <h1 className="text-5xl text-fg sm:text-6xl lg:text-7xl">{title}</h1>
        {description && <p className="mt-4 max-w-xl text-sm text-fg-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
