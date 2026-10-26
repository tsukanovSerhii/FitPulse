import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useAppSelector } from '@/app/hooks'

export const MainLayout: React.FC = () => {
  const themeMode = useAppSelector((state) => state.theme.mode)
  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 ${
        themeMode === 'light'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-[#090d16] text-slate-100'
      }`}
    >
      {/* Background ambient lighting (dark mode only) */}
      {themeMode === 'dark' && (
        <>
          <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="fixed bottom-10 -right-40 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        </>
      )}

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in relative z-10 selection:bg-sky-500 selection:text-slate-950">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
