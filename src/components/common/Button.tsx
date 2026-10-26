import React, { type ButtonHTMLAttributes } from 'react'

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
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 font-medium',
    md: 'px-4 py-2.5 text-xs sm:text-sm gap-2 font-semibold',
    lg: 'px-6 py-3 text-sm sm:text-base gap-2.5 font-bold shadow-lg',
  }

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 border border-purple-400/20 focus:ring-purple-500',
    secondary:
      'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700/70 hover:border-slate-600 shadow-sm focus:ring-slate-400',
    outline:
      'border border-purple-500/40 text-purple-300 hover:bg-purple-500/15 hover:border-purple-400 focus:ring-purple-500',
    danger:
      'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 focus:ring-rose-500',
    ghost:
      'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 focus:ring-slate-400',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/20 focus:ring-emerald-500',
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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
