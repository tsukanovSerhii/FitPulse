import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Dumbbell, Calendar, Flame, TrendingUp, User, Moon, Sun, PlayCircle, Menu, X } from 'lucide-react'
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
    { label: 'Головна', path: '/', icon: <Flame className="w-4 h-4" /> },
    { label: 'Вправи', path: '/exercises', icon: <Dumbbell className="w-4 h-4" /> },
    { label: 'Плани', path: '/plans', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Прогрес', path: '/progress', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Профіль', path: '/profile', icon: <User className="w-4 h-4" /> },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight gradient-text">FitPulse</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-1">
              Workout Tracker
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface/60'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Active Workout indicator button */}
          {session.isActive ? (
            <Link
              to="/workout"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-medium text-xs shadow-md shadow-purple-600/40 animate-pulse"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Тренування: {formatDuration(session.elapsedSeconds)}</span>
            </Link>
          ) : (
            <Link
              to="/workout"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 font-medium text-xs transition-colors"
            >
              <PlayCircle className="w-4 h-4 text-purple-400" />
              <span>Почати тренування</span>
            </Link>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-xl border border-border bg-surface/60 text-slate-400 hover:text-slate-100 hover:bg-surface transition-colors"
            aria-label="Перемкнути тему"
            title="Перемкнути тему"
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-border bg-surface text-slate-400 hover:text-slate-100"
            aria-label="Меню"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? 'bg-purple-600/20 text-purple-400 font-bold'
                    : 'text-slate-300 hover:bg-surface'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
          <Link
            to="/workout"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-400 bg-purple-500/10 mt-2"
          >
            <PlayCircle className="w-4 h-4" />
            {session.isActive ? `В активне тренування (${formatDuration(session.elapsedSeconds)})` : 'Почати тренування'}
          </Link>
        </div>
      )}
    </header>
  )
}
