import { cn } from '@/shared/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold tracking-wide whitespace-nowrap select-none cursor-pointer rounded-md ' +
  'transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.98] ' +
  'disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  secondary: 'bg-surface-2 text-fg hover:bg-line-strong',
  outline: 'border border-line-strong text-fg hover:border-accent hover:text-accent',
  ghost: 'text-fg-muted hover:text-fg hover:bg-surface-2',
  danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-bg',
  success: 'bg-success-soft text-success hover:bg-success hover:text-bg',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-sm uppercase',
}

/** Button classes for links and other elements that should look like a button. */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}
