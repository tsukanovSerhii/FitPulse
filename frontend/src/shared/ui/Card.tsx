import { type HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' }

export function Card({ hover = false, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line bg-surface transition-colors duration-200',
        paddings[padding],
        hover && 'cursor-pointer hover:border-line-strong',
        className,
      )}
      {...props}
    />
  )
}
