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
      className={`bg-[#121622] border border-white/[0.07] rounded-3xl p-5 sm:p-7 shadow-xl shadow-black/40 transition-all duration-300 ${
        hover
          ? 'hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
