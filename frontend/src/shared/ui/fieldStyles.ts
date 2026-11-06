import { cn } from '@/shared/lib/cn'

export function controlClasses(error?: string) {
  return cn(
    'w-full h-11 rounded-md border bg-surface-2 px-3.5 text-sm text-fg placeholder:text-fg-subtle',
    'transition-colors duration-200 focus:outline-none focus-visible:outline-none focus:border-accent',
    'disabled:opacity-50',
    error ? 'border-danger' : 'border-line hover:border-line-strong',
  )
}

export function describedBy(id: string, error?: string, helperText?: string) {
  if (error) return `${id}-error`
  if (helperText) return `${id}-help`
  return undefined
}
