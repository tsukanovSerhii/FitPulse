import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface DisclosureProps {
  title: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function Disclosure({ title, children, defaultOpen = false, className }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <div className={cn('border-t border-line', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-fg"
      >
        {title}
        <ChevronDown className={cn('size-4 shrink-0 text-fg-muted transition-transform duration-300', open && 'rotate-180')} aria-hidden="true" />
      </button>
      <div id={id} className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden" inert={!open}>
          <div className="pb-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
