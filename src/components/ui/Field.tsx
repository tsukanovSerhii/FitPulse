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
