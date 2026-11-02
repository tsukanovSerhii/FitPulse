import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useAppSelector } from '@/app/hooks'

export const MainLayout: React.FC = () => {
  const themeMode = useAppSelector((state) => state.theme.mode)
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-200 bg-t-page text-t-1">
      {/* Background ambient lighting (dark mode only) */}
      {themeMode === 'dark' && (
        <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />
      )}

      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
