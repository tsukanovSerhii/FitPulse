import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Dumbbell,
  Calendar,
  Flame,
  TrendingUp,
  User,
  Moon,
  Sun,
  Play,
  Menu,
  X,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toggleTheme } from '@/features/theme/model/themeSlice'
import { formatDuration } from '@/utils/formatters'

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const themeMode = useAppSelector((state) => state.theme.mode)
  const session = useAppSelector((state) => state.workoutSession)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Головна', path: '/', icon: Flame },
    { label: 'Вправи', path: '/exercises', icon: Dumbbell },
    { label: 'Програми', path: '/plans', icon: Calendar },
    { label: 'Прогрес', path: '/progress', icon: TrendingUp },
    { label: 'Профіль', path: '/profile', icon: User },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo - Apollo Next style bold typography */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[#d4ff00] text-black flex items-center justify-center font-black shadow-lg shadow-[#d4ff00]/20 group-hover:scale-105 transition-transform duration-300">
            <Dumbbell className="w-5 h-5 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-[#d4ff00] transition-colors">
                FITPULSE
              </span>
              <span className="w-2 h-2 rounded-full bg-[#d4ff00] animate-pulse" />
            </div>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase -mt-1">
              Apollo Next Space
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131720] px-3 py-1.5 rounded-full border border-white/5">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  active
                    ? 'bg-[#d4ff00] text-black shadow-md shadow-[#d4ff00]/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-black' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side CTA actions */}
        <div className="flex items-center gap-2.5">
          {session.isActive ? (
            <Link
              to="/workout"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#d4ff00] text-black font-extrabold text-xs shadow-lg shadow-[#d4ff00]/25 hover:bg-[#bde600] transition-all animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              <span>Тренування: {formatDuration(session.elapsedSeconds)}</span>
            </Link>
          ) : (
            <Link
              to="/workout"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#d4ff00] hover:bg-[#bde600] text-black font-extrabold text-xs transition-all shadow-md shadow-[#d4ff00]/15 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-black text-black" />
              <span>Почати тренування</span>
            </Link>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2.5 rounded-2xl border border-white/10 bg-[#131720] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Перемкнути тему"
            title="Перемкнути тему"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-[#d4ff00]" />
            ) : (
              <Moon className="w-4 h-4 text-purple-400" />
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-2xl border border-white/10 bg-[#131720] text-slate-300 hover:text-white"
            aria-label="Меню"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0b0e14]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                  active
                    ? 'bg-[#d4ff00] text-black'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
          <Link
            to="/workout"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl text-sm font-black text-black bg-[#d4ff00] mt-3 shadow-lg shadow-[#d4ff00]/20"
          >
            <Play className="w-4 h-4 fill-black" />
            {session.isActive ? `Продовжити тренування (${formatDuration(session.elapsedSeconds)})` : 'Почати тренування'}
          </Link>
        </div>
      )}
    </header>
  )
}
