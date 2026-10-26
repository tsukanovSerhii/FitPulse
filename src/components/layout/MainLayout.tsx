import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 relative selection:bg-sky-500 selection:text-slate-950 overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 -right-40 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
