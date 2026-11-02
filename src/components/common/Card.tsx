import React from 'react'

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
      className={`
        border rounded-3xl p-5 sm:p-7 shadow-xl transition-all duration-300
        bg-t-card border-t-d
        ${hover ? 'hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-2xl cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
