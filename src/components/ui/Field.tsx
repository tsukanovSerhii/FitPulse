import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface FieldProps {
  id?: string
  label?: string
  error?: string
  helperText?: string
  children: ReactNode
  className?: string
}

/** Спільна обгортка поля форми: видимий лейбл, підказка, помилка біля поля. */
export function Field({ id, label, error, helperText, children, className }: FieldProps) {
  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <span id={id ? `${id}-error` : undefined} role="alert" className="text-xs font-medium text-danger">
          {error}
        </span>
      ) : helperText ? (
        <span id={id ? `${id}-help` : undefined} className="text-xs text-fg-subtle">
          {helperText}
        </span>
      ) : null}
    </div>
  )
}

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
