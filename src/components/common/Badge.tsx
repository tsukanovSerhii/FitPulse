import React from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold gap-1.5',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
  }

  const variantClasses = {
    primary:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    success:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    danger:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    info:
      'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    neutral:
      'bg-t-subtle text-t-2 border border-t-d',
  }

  const dotClasses = {
    primary: 'bg-emerald-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-slate-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full tracking-tight transition-colors',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClasses[variant])} />}
      {children}
    </span>
  )
}
