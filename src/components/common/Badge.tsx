import React from 'react'

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
    sm: 'px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold gap-1.5',
    md: 'px-3.5 py-1 text-xs font-bold gap-2',
  }

  const variantClasses = {
    primary:
      'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
    success:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-400 dark:border-emerald-400/30',
    warning:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/30',
    danger:
      'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    info:
      'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/30',
    neutral:
      'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10',
  }

  const dotClasses = {
    primary: 'bg-sky-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-sky-400',
    neutral: 'bg-slate-400',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-tight transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]} shrink-0`} />}
      {children}
    </span>
  )
}
