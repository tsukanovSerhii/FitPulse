import { type InputHTMLAttributes, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  hint?: ReactNode
}

export function Checkbox({ label, hint, className, ...props }: CheckboxProps) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3 text-sm', className)}>
      <span className="relative mt-0.5 flex size-5 shrink-0">
        <input
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded-sm border border-line-strong bg-surface transition-colors checked:border-fg checked:bg-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          {...props}
        />
        <Check
          className="pointer-events-none absolute inset-0 m-auto size-3.5 text-bg opacity-0 peer-checked:opacity-100"
          strokeWidth={3}
          aria-hidden="true"
        />
      </span>
      <span>
        <span className="font-medium text-fg">{label}</span>
        {hint && <span className="block text-xs text-fg-subtle">{hint}</span>}
      </span>
    </label>
  )
}
