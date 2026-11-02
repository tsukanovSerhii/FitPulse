import React, { type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 font-semibold rounded-lg',
    md: 'px-4 py-2.5 text-xs sm:text-sm gap-2 font-bold rounded-xl',
    lg: 'px-6 py-3.5 text-sm sm:text-base gap-2.5 font-bold rounded-xl shadow-sm',
  }

  const variantClasses = {
    primary:
      'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-950/20 border border-emerald-500/30',
    secondary:
      'bg-t-subtle hover:bg-t-hover text-t-1 border border-t-d shadow-xs',
    outline:
      'border border-t-d text-t-2 hover:text-t-1 hover:bg-t-hover',
    danger:
      'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20',
    ghost:
      'text-t-2 hover:text-t-1 hover:bg-t-hover',
    success:
      'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-sm border border-emerald-500/30',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
