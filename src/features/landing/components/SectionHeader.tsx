import type { ReactNode } from 'react'
import { SectionLabel } from '@/components/ui'
import { cn } from '@/utils/cn'

interface SectionHeaderProps {
  index: number
  label: string
  title: ReactNode
  lead?: ReactNode
  id?: string
  className?: string
}

export function SectionHeader({ index, label, title, lead, id, className }: SectionHeaderProps) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-end', className)}>
      <SectionLabel index={index}>{label}</SectionLabel>
      <div className="space-y-5">
        <h2 id={id} className="text-5xl leading-[1.05] text-fg sm:text-6xl lg:text-7xl">
          {title}
        </h2>
        {lead && <p className="max-w-2xl text-lg text-fg-muted sm:text-xl">{lead}</p>}
      </div>
    </div>
  )
}
