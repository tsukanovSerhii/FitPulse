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
      className={`bg-slate-900/75 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/25 ${
        hover ? 'glow-card cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
