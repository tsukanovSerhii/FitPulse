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
    'inline-flex items-center justify-center font-bold tracking-tight rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none'

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 font-semibold',
    md: 'px-5 py-2.5 text-xs sm:text-sm gap-2 font-bold',
    lg: 'px-7 py-3.5 text-sm sm:text-base gap-2.5 font-extrabold shadow-md',
  }

  const variantClasses = {
    primary:
      'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold shadow-md shadow-sky-950/20 border border-sky-400/20 active:shadow-none',
    secondary:
      'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-300/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:active:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm',
    outline:
      'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60 dark:hover:border-slate-600',
    danger:
      'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/25',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5',
    success:
      'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border border-emerald-400/20 shadow-md shadow-emerald-950/20 font-bold',
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
