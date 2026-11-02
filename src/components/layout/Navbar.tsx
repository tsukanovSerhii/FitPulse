import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toggleTheme } from '@/features/theme/model/themeSlice'
import { formatDuration } from '@/utils/formatters'
import {
	Calendar,
	Dumbbell,
	Flame,
	Menu,
	Moon,
	Play,
	Sun,
	TrendingUp,
	User,
	X
} from 'lucide-react'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

export const Navbar: React.FC = () => {
	const dispatch = useAppDispatch()
	const location = useLocation()
	const themeMode = useAppSelector(state => state.theme.mode)
	const session = useAppSelector(state => state.workoutSession)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const navItems = [
		{ label: 'Головна', path: '/', icon: Flame },
		{ label: 'Вправи', path: '/exercises', icon: Dumbbell },
		{ label: 'Програми', path: '/plans', icon: Calendar },
		{ label: 'Прогрес', path: '/progress', icon: TrendingUp },
		{ label: 'Профіль', path: '/profile', icon: User }
	]

	const isActive = (path: string) => {
		if (path === '/') return location.pathname === '/'
		return location.pathname.startsWith(path)
	}

	return (
		<header className="sticky top-0 z-50 w-full glass-nav transition-all duration-200">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
				{/* Brand Logo */}
				<Link
					to="/"
					className="flex items-center gap-2.5 group shrink-0"
				>
					<div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
						<Dumbbell className="w-4.5 h-4.5 -rotate-45" />
					</div>
					<div className="flex flex-col">
						<div className="flex items-center gap-1.5">
							<span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-t-1 group-hover:text-emerald-500 transition-colors">
								FITPULSE
							</span>
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
						</div>
						<span className="text-[10px] font-semibold tracking-wider uppercase -mt-0.5 text-t-3">
							Performance Tracker
						</span>
					</div>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-1 p-1 rounded-xl border border-t-d bg-t-card">
					{navItems.map(item => {
						const active = isActive(item.path)
						const Icon = item.icon
						return (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
									active
										? 'bg-emerald-600 text-white shadow-xs'
										: 'text-t-2 hover:text-t-1 hover:bg-t-hover'
								)}
							>
								<Icon
									className={cn('w-3.5 h-3.5', active ? 'text-white' : 'text-t-3')}
								/>
								{item.label}
							</Link>
						)
					})}
				</nav>

				{/* Right side CTA actions */}
				<div className="flex items-center gap-2">
					{session.isActive ? (
						<Link
							to="/workout"
							className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-sm hover:bg-emerald-400 transition-all animate-pulse"
						>
							<span className="w-2 h-2 rounded-full bg-white animate-ping" />
							<span>Тренування: {formatDuration(session.elapsedSeconds)}</span>
						</Link>
					) : (
						<Link
							to="/workout"
							className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs active:scale-95"
						>
							<Play className="w-3.5 h-3.5 fill-white text-white" />
							<span>Тренуватися</span>
						</Link>
					)}

					{/* Theme Switcher */}
					<button
						onClick={() => dispatch(toggleTheme())}
						className="p-2 rounded-xl border border-t-d bg-t-card hover:bg-t-hover text-t-2 hover:text-t-1 transition-colors cursor-pointer"
						aria-label="Перемкнути тему"
						title="Перемкнути тему (Світла / Темна)"
					>
						{themeMode === 'dark' ? (
							<Sun className="w-4 h-4 text-emerald-400" />
						) : (
							<Moon className="w-4 h-4 text-emerald-600" />
						)}
					</button>

					{/* Mobile hamburger */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="md:hidden p-2 rounded-xl border border-t-d bg-t-card text-t-2 hover:text-t-1 transition-colors"
						aria-label="Меню"
					>
						{mobileMenuOpen ? (
							<X className="w-5 h-5" />
						) : (
							<Menu className="w-5 h-5" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Drawer */}
			{mobileMenuOpen && (
				<div className="md:hidden border-t border-t-d px-4 pt-3 pb-5 space-y-1.5 animate-fade-in backdrop-blur-2xl bg-t-card/95">
					{navItems.map(item => {
						const active = isActive(item.path)
						const Icon = item.icon
						return (
							<Link
								key={item.path}
								to={item.path}
								onClick={() => setMobileMenuOpen(false)}
								className={cn(
									'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
									active
										? 'bg-emerald-600 text-white'
										: 'text-t-2 hover:bg-t-hover'
								)}
							>
								<Icon className="w-4 h-4" />
								{item.label}
							</Link>
						)
					})}
					<Link
						to="/workout"
						onClick={() => setMobileMenuOpen(false)}
						className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 mt-2 shadow-xs"
					>
						<Play className="w-4 h-4 fill-white" />
						{session.isActive
							? `Продовжити тренування (${formatDuration(session.elapsedSeconds)})`
							: 'Почати тренування'}
					</Link>
				</div>
			)}
		</header>
	)
}
