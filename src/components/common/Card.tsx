import React from 'react'
import { useAppSelector } from '@/app/hooks'

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
  const themeMode = useAppSelector((state) => state.theme.mode)
  return (
    <div
      onClick={onClick}
      className={`border rounded-3xl p-5 sm:p-7 shadow-xl transition-all duration-300 ${
        themeMode === 'light'
          ? 'bg-white border-slate-200 shadow-slate-200/60'
          : 'bg-[#121622] border-white/[0.07] shadow-black/40'
      } ${
        hover
          ? themeMode === 'light'
            ? 'hover:-translate-y-1 hover:border-sky-300/60 hover:shadow-sky-100 cursor-pointer'
            : 'hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
