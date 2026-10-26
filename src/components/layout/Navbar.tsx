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
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 group-hover:shadow-purple-600/50 transition-all">
              <Dumbbell className="w-5 h-5 -rotate-45" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight gradient-text-brand">
              FitPulse
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase -mt-1">
              Pro Fitness App
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/60 shadow-inner">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Active Workout CTA */}
          {session.isActive ? (
            <Link
              to="/workout"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/40 hover:from-purple-500 hover:to-indigo-500 transition-all animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              <span>Тренування: {formatDuration(session.elapsedSeconds)}</span>
            </Link>
          ) : (
            <Link
              to="/workout"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 hover:text-purple-200 border border-purple-500/30 font-bold text-xs transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
              <span>Почати тренування</span>
            </Link>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            aria-label="Перемкнути тему"
            title={themeMode === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-purple-400" />
            )}
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            aria-label="Меню"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1.5 animate-fade-in">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
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
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 mt-3 shadow-lg shadow-purple-600/30"
          >
            <Play className="w-4 h-4 fill-white" />
            {session.isActive ? `Продовжити тренування (${formatDuration(session.elapsedSeconds)})` : 'Почати тренування'}
          </Link>
        </div>
      )}
    </header>
  )
}
