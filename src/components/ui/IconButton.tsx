import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Required: the button has no visible text. */
  label: string
  icon: ReactNode
  size?: 'sm' | 'md'
  active?: boolean
}

export function IconButton({ label, icon, size = 'md', active, className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md cursor-pointer transition-colors duration-200',
        'text-fg-muted hover:text-fg hover:bg-surface-2 disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' ? 'size-9 [&_svg]:size-4' : 'size-11 [&_svg]:size-5',
        active && 'text-accent hover:text-accent',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
