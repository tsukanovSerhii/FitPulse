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
      className={`bg-[#131720] border border-white/[0.07] rounded-3xl p-5 sm:p-7 shadow-xl shadow-black/40 transition-all duration-300 ${
        hover
          ? 'hover:-translate-y-1 hover:border-[#d4ff00]/30 hover:shadow-[#d4ff00]/5 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
