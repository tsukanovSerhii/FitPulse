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
    sm: 'px-2.5 py-0.5 text-[11px] font-semibold gap-1.5',
    md: 'px-3 py-1 text-xs font-semibold gap-2',
  }

  const variantClasses = {
    primary: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    info: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    neutral: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
  }

  const dotClasses = {
    primary: 'bg-purple-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-sky-400',
    neutral: 'bg-slate-400',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]} shrink-0`} />}
      {children}
    </span>
  )
}
