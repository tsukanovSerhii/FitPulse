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
    'inline-flex items-center justify-center font-bold tracking-tight rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#d4ff00]/50 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none'

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 font-semibold',
    md: 'px-5 py-2.5 text-xs sm:text-sm gap-2 font-bold',
    lg: 'px-7 py-3.5 text-sm sm:text-base gap-2.5 font-extrabold shadow-md',
  }

  const variantClasses = {
    primary:
      'bg-[#d4ff00] text-black hover:bg-[#bde600] shadow-lg shadow-[#d4ff00]/15 hover:shadow-[#d4ff00]/30 active:shadow-none',
    secondary:
      'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 shadow-sm',
    outline:
      'border-2 border-[#d4ff00]/60 text-[#d4ff00] hover:bg-[#d4ff00]/10 hover:border-[#d4ff00]',
    danger:
      'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25',
    ghost:
      'text-slate-400 hover:text-white hover:bg-white/5',
    success:
      'bg-emerald-400 text-black hover:bg-emerald-300 shadow-md shadow-emerald-400/20 font-black',
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
