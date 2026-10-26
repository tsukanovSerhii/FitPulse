import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] dark:bg-[#080c14] text-slate-100 relative selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* Background ambient lighting effects */}
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-purple-600/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 -left-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 -right-40 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
