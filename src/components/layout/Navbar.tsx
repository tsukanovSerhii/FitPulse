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
        {/* Brand Logo - Minimalist clean typography */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform duration-300">
            <Dumbbell className="w-5 h-5 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-sky-400 transition-colors">
                FITPULSE
              </span>
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            </div>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase -mt-1">
              Minimalist Workout Tracker
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121622] px-3 py-1.5 rounded-full border border-white/5">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  active
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 hover:bg-sky-400 transition-all animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Тренування: {formatDuration(session.elapsedSeconds)}</span>
            </Link>
          ) : (
            <Link
              to="/workout"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs transition-all shadow-md shadow-sky-950/40 border border-sky-400/20 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Почати тренування</span>
            </Link>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2.5 rounded-2xl border border-white/10 bg-[#121622] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Перемкнути тему"
            title="Перемкнути тему"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-sky-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-400" />
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-2xl border border-white/10 bg-[#121622] text-slate-300 hover:text-white"
            aria-label="Меню"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#090d16]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 animate-fade-in">
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
                    ? 'bg-sky-600 text-white'
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
            className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl text-sm font-black text-white bg-sky-600 hover:bg-sky-500 mt-3 shadow-lg shadow-sky-950/40 border border-sky-400/20"
          >
            <Play className="w-4 h-4 fill-white" />
            {session.isActive ? `Продовжити тренування (${formatDuration(session.elapsedSeconds)})` : 'Почати тренування'}
          </Link>
        </div>
      )}
    </header>
  )
}
