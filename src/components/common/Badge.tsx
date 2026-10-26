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
    primary: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    success: 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30',
    warning: 'bg-amber-400/15 text-amber-300 border border-amber-400/30',
    danger: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    info: 'bg-sky-400/15 text-sky-300 border border-sky-400/30',
    neutral: 'bg-white/5 text-slate-300 border border-white/10',
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
