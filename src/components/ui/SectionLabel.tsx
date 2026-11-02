import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface SectionLabelProps {
  index?: number
  children: ReactNode
  rule?: boolean
  className?: string
}

export function SectionLabel({ index, children, rule = false, className }: SectionLabelProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-baseline gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
        {index !== undefined && <span className="font-mono text-accent">/ {String(index).padStart(2, '0')}</span>}
        <span className="text-fg">{children}</span>
      </div>
      {rule && (
        <div className="relative h-px w-full bg-line" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-accent" />
        </div>
      )}
    </div>
  )
}
