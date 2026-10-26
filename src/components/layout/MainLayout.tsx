import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100 relative selection:bg-[#d4ff00] selection:text-black overflow-x-hidden">
      {/* Background ambient lighting in Apollo Next cosmic style */}
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#d4ff00]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 -right-40 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
