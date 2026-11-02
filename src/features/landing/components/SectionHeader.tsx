import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SectionHeaderProps {
  index: number
  label: string
  title: ReactNode
  lead?: ReactNode
  id?: string
  className?: string
}

export function SectionEyebrow({ index, label }: { index: number; label: string }) {
  return (
    <p className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent-soft py-1.5 pl-2 pr-4 text-sm font-semibold uppercase tracking-[0.14em] text-fg">
      <span className="rounded-full bg-bg px-2 py-0.5 font-mono text-xs text-accent">{String(index).padStart(2, '0')}</span>
      {label}
    </p>
  )
}

export function SectionHeader({ index, label, title, lead, id, className }: SectionHeaderProps) {
  return (
    <div className={cn('grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16', className)}>
      <div className="space-y-6">
        <SectionEyebrow index={index} label={label} />
        <h2 id={id} className="text-5xl leading-[1.05] text-fg sm:text-6xl lg:text-7xl">
          {title}
        </h2>
      </div>
      {lead && <p className="max-w-xl text-lg text-fg-muted sm:text-xl lg:pb-2">{lead}</p>}
    </div>
  )
}
