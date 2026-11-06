import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

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
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-surface-2',
        'after:absolute after:inset-0 after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-fg/[0.06] after:to-transparent',
        className,
      )}
      aria-hidden="true"
    />
  )
}

/** Text placeholder: the last line is shorter, like a real paragraph. */
export function SkeletonText({ lines = 2, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full')} />
      ))}
    </div>
  )
}

/** Wraps skeletons so screen readers hear one "loading" message instead of empty shapes. */
export function LoadingRegion({ label = 'Завантаження', children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
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

export function PageHeader({
  index,
  eyebrow,
  title,
  description,
  actions,
  compact = false,
  className,
}: {
  index?: number
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  compact?: boolean
  className?: string
}) {
  if (compact) {
    return (
      <header className={cn('flex items-end justify-between gap-4', className)}>
        <div className="min-w-0">
          <h1 className="text-3xl leading-[1.12] text-fg sm:text-4xl">{title}</h1>
          {description && <p className="mt-1 hidden text-sm text-fg-muted sm:block">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </header>
    )
  }

  return (
    <header className={cn('flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {(index !== undefined || eyebrow) && (
          <div className="mb-4 flex items-baseline gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
            {index !== undefined && <span className="font-mono text-accent">/ {String(index).padStart(2, '0')}</span>}
            {eyebrow && <span className="text-fg-subtle">{eyebrow}</span>}
          </div>
        )}
        <h1 className="text-5xl leading-[1.12] text-fg sm:text-6xl sm:leading-[1.12] lg:text-7xl lg:leading-[1.12]">{title}</h1>
        {description && <p className="mt-4 max-w-xl text-sm text-fg-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
