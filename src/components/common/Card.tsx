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
      className={`bg-card/80 backdrop-blur-md border border-border rounded-2xl p-5 shadow-lg shadow-black/20 ${
        hover ? 'card-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
