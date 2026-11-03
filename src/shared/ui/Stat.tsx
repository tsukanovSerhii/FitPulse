import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export interface StatProps {
  label: string
  value: ReactNode
  unit?: string
  hint?: ReactNode
  icon?: ReactNode
  accent?: boolean
  size?: 'md' | 'lg'
  className?: string
}

export function Stat({ label, value, unit, hint, icon, accent, size = 'md', className }: StatProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">
        {icon && <span className="[&_svg]:size-3.5">{icon}</span>}
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-mono font-semibold leading-none tabular tracking-tight',
            size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl',
            accent ? 'text-accent' : 'text-fg',
          )}
        >
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-fg-subtle">{unit}</span>}
      </div>
      {hint && <div className="text-xs text-fg-muted">{hint}</div>}
    </div>
  )
}
