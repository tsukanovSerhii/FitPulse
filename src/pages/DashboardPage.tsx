import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Card } from '@/components/ui'
import { SEO } from '@/components/common/SEO'
import { fetchExercises } from '@/features/exercises/model/exercisesSlice'
import { MUSCLE_GROUP_LABELS } from '@/features/exercises/model/types'
import { fetchProfile } from '@/features/profile/model/profileSlice'
import { FITNESS_GOAL_LABELS } from '@/features/profile/model/types'
import { fetchProgress } from '@/features/progress/model/progressSlice'
import { DAY_LABELS, type DayOfWeek } from '@/features/workoutPlan/model/types'
import { fetchPlans } from '@/features/workoutPlan/model/workoutPlanSlice'
import { startWorkout } from '@/features/workoutSession/model/workoutSessionSlice'
import { formatDuration } from '@/utils/formatters'
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	Dumbbell,
	Flame,
	Play,
	Sparkles,
	TrendingUp,
	Trophy,
	Zap
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function getCurrentDayOfWeek(): DayOfWeek {
	const dayIndex = new Date().getDay()
	if (dayIndex === 0) return 'sunday'
	if (dayIndex === 1) return 'monday'
	if (dayIndex === 2) return 'tuesday'
	if (dayIndex === 3) return 'wednesday'
	if (dayIndex === 4) return 'thursday'
	if (dayIndex === 5) return 'friday'
	return 'saturday'
}

export const DashboardPage: React.FC = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	useEffect(() => {
		dispatch(fetchExercises())
		dispatch(fetchPlans())
		dispatch(fetchProgress())
		dispatch(fetchProfile())
	}, [dispatch])

	const profile = useAppSelector(state => state.profile.profile)
	const plansState = useAppSelector(state => state.workoutPlan)
	const exercisesState = useAppSelector(state => state.exercises)
	const progressState = useAppSelector(state => state.progress)
	const session = useAppSelector(state => state.workoutSession)

	const [currentDayKey] = useState<DayOfWeek>(getCurrentDayOfWeek)

	const activePlan =
		plansState.plans.find(p => p.id === plansState.activePlanId) ||
		plansState.plans[0]
	const todayExercises = activePlan?.schedule[currentDayKey] || []

	// Exercise map for fast name lookup
	const exerciseMap = React.useMemo(() => {
		const map = new Map<string, (typeof exercisesState.items)[0]>()
		exercisesState.items.forEach(e => map.set(e.id, e))
		return map
	}, [exercisesState.items])

	const handleStartTodayWorkout = () => {
		if (todayExercises.length === 0) {
			navigate('/workout')
			return
		}
		dispatch(
			startWorkout({
				planId: activePlan?.id || null,
				dayLabel: `${DAY_LABELS[currentDayKey]} (${activePlan?.name})`,
				exercises: todayExercises
			})
		)
		navigate('/workout')
	}

	// Performance statistics
	const totalWorkouts = progressState.history.length
	const totalVolumeKg = progressState.history.reduce(
		(a, b) => a + b.totalVolumeKg,
		0
	)
	const totalVolumeTons = (totalVolumeKg / 1000).toFixed(1)
	const totalPrs = Object.keys(progressState.personalRecords).length
	const totalSetsToday = todayExercises.reduce((acc, e) => acc + e.sets, 0)

	const todayDateString = new Intl.DateTimeFormat('uk-UA', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	}).format(new Date())

	return (
		<div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
			<SEO
				title="Головна панель"
				description="FitPulse — Щоденник та планувальник силових тренувань: фокус дня, показники тоннажу та швидкий старт."
			/>

			{/* =========================================================================
          TOP BAR: GREETING & CONTEXT
      ========================================================================= */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xs font-semibold text-t-3 capitalize">
							{todayDateString}
						</span>
						<span className="text-t-4">•</span>
						<Badge variant="primary" size="sm">
							{FITNESS_GOAL_LABELS[profile.fitnessGoal] || 'Сила та форма'}
						</Badge>
					</div>
					<h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-t-1 tracking-tight">
						Привіт, {profile.name || 'Атлете'}!
					</h1>
				</div>

				{session.isActive && (
					<Link
						to="/workout"
						className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all animate-pulse"
					>
						<span className="w-2 h-2 rounded-full bg-white" />
						<span>Активне тренування: {formatDuration(session.elapsedSeconds)}</span>
						<ArrowRight className="w-3.5 h-3.5" />
					</Link>
				)}
			</div>

			{/* =========================================================================
          MAIN TRAINING HERO CARD (FOCUSED HIGH-SIGNAL UI)
      ========================================================================= */}
			<Card className="p-6 sm:p-8 bg-t-card border-t-d relative overflow-hidden">
				{/* Background accent aura */}
				<div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

				<div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
					<div className="space-y-3 max-w-xl">
						<div className="flex items-center gap-2">
							<Badge variant={todayExercises.length > 0 ? 'success' : 'neutral'} dot size="md">
								{activePlan?.name || 'План не обрано'}
							</Badge>
							<span className="text-xs font-semibold text-t-3">
								{DAY_LABELS[currentDayKey]}
							</span>
						</div>

						{todayExercises.length > 0 ? (
							<>
								<h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-t-1 tracking-tight leading-snug">
									Сьогоднішнє тренування за планом
								</h2>
								<p className="text-xs sm:text-sm text-t-2 font-medium">
									Заплановано <strong className="text-t-1">{todayExercises.length} вправ</strong>,{' '}
									<strong className="text-t-1">{totalSetsToday} підходів</strong> • приблизно{' '}
									{todayExercises.length * 10}–{todayExercises.length * 12} хв
								</p>
							</>
						) : (
							<>
								<h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-t-1 tracking-tight leading-snug">
									Сьогодні день відновлення 🌱
								</h2>
								<p className="text-xs sm:text-sm text-t-2 font-medium">
									За планом на сьогодні тренувань немає. Ви можете відпочити або розпочати вільне заняття в будь-який момент.
								</p>
							</>
						)}
					</div>

					<div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
						{todayExercises.length > 0 ? (
							<Button
								variant="primary"
								size="lg"
								onClick={handleStartTodayWorkout}
								icon={<Play className="w-5 h-5 fill-white text-white" />}
								className="w-full sm:w-auto text-sm sm:text-base font-extrabold"
							>
								Почати тренування ({todayExercises.length} вправ)
							</Button>
						) : (
							<Button
								variant="primary"
								size="lg"
								onClick={() => navigate('/workout')}
								icon={<Play className="w-5 h-5 fill-white text-white" />}
								className="w-full sm:w-auto"
							>
								Вільне тренування
							</Button>
						)}

						<Button
							variant="outline"
							size="md"
							onClick={() => navigate('/plans')}
							icon={<Calendar className="w-4 h-4" />}
							className="w-full sm:w-auto text-xs"
						>
							Налаштувати розклад
						</Button>
					</div>
				</div>

				{/* Scheduled exercises preview chips (clean & compact) */}
				{todayExercises.length > 0 && (
					<div className="mt-6 pt-5 border-t border-t-d">
						<span className="text-[11px] font-bold uppercase tracking-wider text-t-3 block mb-3">
							Вправи на сьогодні:
						</span>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
							{todayExercises.map((pEx, idx) => {
								const ex = exerciseMap.get(pEx.exerciseId)
								return (
									<div
										key={pEx.id}
										className="flex items-center justify-between p-3 rounded-xl bg-t-subtle border border-t-d"
									>
										<div className="flex items-center gap-2.5 min-w-0">
											<span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
												{idx + 1}
											</span>
											<div className="truncate">
												<span className="text-xs font-bold text-t-1 block truncate">
													{ex?.name || 'Вправа'}
												</span>
												<span className="text-[11px] text-t-3 font-medium">
													{pEx.sets} сети × {pEx.reps} повт
													{pEx.weight ? ` • ${pEx.weight} кг` : ''}
												</span>
											</div>
										</div>
										{ex && (
											<span className="text-[10px] font-semibold text-t-3 bg-t-card px-2 py-0.5 rounded-md border border-t-d shrink-0 ml-2">
												{MUSCLE_GROUP_LABELS[ex.primaryMuscle]}
											</span>
										)}
									</div>
								)
							})}
						</div>
					</div>
				)}
			</Card>

			{/* =========================================================================
          KEY ATHLETIC METRICS (CLEAN NUMBERS, ZERO JUNK)
      ========================================================================= */}
			<div>
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-sm font-bold uppercase tracking-wider text-t-3">
						Ваш поточний прогрес
					</h3>
					<Link
						to="/progress"
						className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
					>
						<span>Вся аналітика</span>
						<ArrowRight className="w-3.5 h-3.5" />
					</Link>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{/* Metric 1: Total Volume */}
					<Card className="p-5 flex items-center justify-between">
						<div>
							<span className="text-xs font-semibold text-t-3 block mb-1">
								Загальний тоннаж
							</span>
							<div className="text-2xl sm:text-3xl font-mono font-extrabold text-t-1 tracking-tight">
								{totalVolumeKg > 0 ? totalVolumeKg.toLocaleString() : '0'}{' '}
								<span className="text-sm font-sans text-t-3 font-semibold">кг</span>
							</div>
							<span className="text-[11px] text-t-3 mt-1 block">
								≈ {totalVolumeTons} тонни піднятої ваги
							</span>
						</div>
						<div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
							<Flame className="w-5 h-5" />
						</div>
					</Card>

					{/* Metric 2: Completed Sessions */}
					<Card className="p-5 flex items-center justify-between">
						<div>
							<span className="text-xs font-semibold text-t-3 block mb-1">
								Завершено занять
							</span>
							<div className="text-2xl sm:text-3xl font-mono font-extrabold text-t-1 tracking-tight">
								{totalWorkouts}
							</div>
							<span className="text-[11px] text-t-3 mt-1 block">
								сесій у щоденнику
							</span>
						</div>
						<div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0">
							<CheckCircle2 className="w-5 h-5" />
						</div>
					</Card>

					{/* Metric 3: Personal Records */}
					<Card className="p-5 flex items-center justify-between">
						<div>
							<span className="text-xs font-semibold text-t-3 block mb-1">
								Силові рекорди (PR)
							</span>
							<div className="text-2xl sm:text-3xl font-mono font-extrabold text-t-1 tracking-tight">
								{totalPrs}
							</div>
							<span className="text-[11px] text-t-3 mt-1 block">
								вправ із зафіксованим піком
							</span>
						</div>
						<div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
							<Trophy className="w-5 h-5" />
						</div>
					</Card>
				</div>
			</div>

			{/* =========================================================================
          FAST NAVIGATION: 3 CORE MODULES
      ========================================================================= */}
			<div>
				<h3 className="text-sm font-bold uppercase tracking-wider text-t-3 mb-3">
					Основні інструменти
				</h3>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<Link to="/exercises" className="block group">
						<Card hover className="p-5 h-full flex flex-col justify-between">
							<div className="flex items-center gap-3.5 mb-3">
								<div className="w-10 h-10 rounded-xl bg-t-subtle border border-t-d text-t-1 group-hover:text-emerald-500 flex items-center justify-center shrink-0 transition-colors">
									<Dumbbell className="w-5 h-5" />
								</div>
								<div>
									<h4 className="text-sm font-bold text-t-1 group-hover:text-emerald-500 transition-colors">
										База вправ
									</h4>
									<span className="text-xs text-t-3">Анатомія та техніка</span>
								</div>
							</div>
							<div className="flex items-center justify-between text-xs text-t-3 pt-2 border-t border-t-d">
								<span>18 вправ з біомеханікою</span>
								<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
							</div>
						</Card>
					</Link>

					<Link to="/plans" className="block group">
						<Card hover className="p-5 h-full flex flex-col justify-between">
							<div className="flex items-center gap-3.5 mb-3">
								<div className="w-10 h-10 rounded-xl bg-t-subtle border border-t-d text-t-1 group-hover:text-emerald-500 flex items-center justify-center shrink-0 transition-colors">
									<Calendar className="w-5 h-5" />
								</div>
								<div>
									<h4 className="text-sm font-bold text-t-1 group-hover:text-emerald-500 transition-colors">
										Програми тренувань
									</h4>
									<span className="text-xs text-t-3">Спліти та графіки</span>
								</div>
							</div>
							<div className="flex items-center justify-between text-xs text-t-3 pt-2 border-t border-t-d">
								<span>Push / Pull / Legs</span>
								<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
							</div>
						</Card>
					</Link>

					<Link to="/progress" className="block group">
						<Card hover className="p-5 h-full flex flex-col justify-between">
							<div className="flex items-center gap-3.5 mb-3">
								<div className="w-10 h-10 rounded-xl bg-t-subtle border border-t-d text-t-1 group-hover:text-emerald-500 flex items-center justify-center shrink-0 transition-colors">
									<TrendingUp className="w-5 h-5" />
								</div>
								<div>
									<h4 className="text-sm font-bold text-t-1 group-hover:text-emerald-500 transition-colors">
										Історія та аналітика
									</h4>
									<span className="text-xs text-t-3">Журнал та рекорди</span>
								</div>
							</div>
							<div className="flex items-center justify-between text-xs text-t-3 pt-2 border-t border-t-d">
								<span>{totalWorkouts} виконаних сесій</span>
								<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
							</div>
						</Card>
					</Link>
				</div>
			</div>
		</div>
	)
}
