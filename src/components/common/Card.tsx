import React from 'react'
import { cn } from '@/utils/cn'

export interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-t-d bg-t-card p-5 sm:p-6 shadow-sm transition-all duration-200',
        hover && 'hover:border-emerald-500/40 hover:shadow-md cursor-pointer hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  )
}
