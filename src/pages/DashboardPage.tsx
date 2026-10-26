import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Dumbbell,
  Play,
  Calendar,
  TrendingUp,
  Flame,
  Trophy,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchExercises } from '@/features/exercises/model/exercisesSlice'
import { fetchPlans } from '@/features/workoutPlan/model/workoutPlanSlice'
import { fetchProgress } from '@/features/progress/model/progressSlice'
import { fetchProfile } from '@/features/profile/model/profileSlice'
import { startWorkout } from '@/features/workoutSession/model/workoutSessionSlice'
import { DAY_LABELS, type DayOfWeek } from '@/features/workoutPlan/model/types'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { FITNESS_GOAL_LABELS } from '@/features/profile/model/types'
import { MUSCLE_GROUP_LABELS } from '@/features/exercises/model/types'
import { updatePageSEO } from '@/utils/seo'

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
    updatePageSEO({
      title: 'FitPulse — Трекер та планувальник тренувань у залі',
      description: 'Головна панель тренувань FitPulse: щоденний розклад вправ, тоннаж, силові рекорди та персональні програми.',
      keywords: ['тренування сьогодні', 'план на тиждень', 'фітнес трекер'],
    })
    dispatch(fetchExercises())
    dispatch(fetchPlans())
    dispatch(fetchProgress())
    dispatch(fetchProfile())
  }, [dispatch])

  const profile = useAppSelector((state) => state.profile.profile)
  const plansState = useAppSelector((state) => state.workoutPlan)
  const exercisesState = useAppSelector((state) => state.exercises)
  const progressState = useAppSelector((state) => state.progress)
  const session = useAppSelector((state) => state.workoutSession)

  const [currentDayKey] = useState<DayOfWeek>(getCurrentDayOfWeek)

  const activePlan =
    plansState.plans.find((p) => p.id === plansState.activePlanId) || plansState.plans[0]
  const todayExercises = activePlan?.schedule[currentDayKey] || []

  // Exercise map
  const exerciseMap = React.useMemo(() => {
    const map = new Map<string, (typeof exercisesState.items)[0]>()
    exercisesState.items.forEach((e) => map.set(e.id, e))
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
        exercises: todayExercises,
      }),
    )
    navigate('/workout')
  }

  // Quick stats
  const totalWorkouts = progressState.history.length
  const totalVolumeKg = progressState.history.reduce((a, b) => a + b.totalVolumeKg, 0)
  const totalVolumeTons = (totalVolumeKg / 1000).toFixed(1)
  const totalPrs = Object.keys(progressState.personalRecords).length

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* =========================================================================
          HERO BANNER
      ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-purple-950/40 border border-slate-800/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" dot size="sm">
                {FITNESS_GOAL_LABELS[profile.fitnessGoal]}
              </Badge>
              <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-3 py-0.5 rounded-full border border-slate-700/60">
                {DAY_LABELS[currentDayKey]}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Привіт, <span className="gradient-text-brand">{profile.name}</span>! 💪
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Сьогодні чудовий день для прогресу. Дотримуйтесь щоденного плану та
              відстежуйте кожен підхід для досягнення цільової форми.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              {session.isActive ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/workout')}
                  icon={<Play className="w-5 h-5 fill-current" />}
                  className="animate-pulse shadow-purple-600/50"
                >
                  Продовжити тренування
                </Button>
              ) : todayExercises.length > 0 ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartTodayWorkout}
                  icon={<Play className="w-5 h-5 fill-current" />}
                >
                  Почати тренування сьогодні ({todayExercises.length} вправ)
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/workout')}
                  icon={<Play className="w-5 h-5 fill-current" />}
                >
                  Почати довільне тренування
                </Button>
              )}

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/plans')}
                icon={<Calendar className="w-4 h-4 text-purple-400" />}
              >
                Мої програми
              </Button>
            </div>
          </div>

          {/* Right Hero Card: Quick Today Summary Widget */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Сьогоднішній план
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {activePlan ? activePlan.name : 'Без плану'}
                </span>
              </div>

              {todayExercises.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {todayExercises.length}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">вправ заплановано</span>
                  </div>

                  {/* Exercise preview pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {todayExercises.slice(0, 3).map((pEx) => {
                      const ex = exerciseMap.get(pEx.exerciseId)
                      return (
                        <span
                          key={pEx.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300"
                        >
                          {ex ? ex.name : 'Вправа'}
                        </span>
                      )
                    })}
                    {todayExercises.length > 3 && (
                      <span className="px-2 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-[11px] font-bold text-purple-300">
                        +{todayExercises.length - 3} ще
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      ~50-60 хвилин
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Flame className="w-3.5 h-3.5" />
                      ~400 ккал
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-sm font-semibold text-slate-200">
                    Сьогодні день відновлення 🧘‍♂️
                  </p>
                  <p className="text-xs text-slate-400">
                    Дайте м'язам відпочити або виберіть легке кардіо.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KEY STATS CARDS
      ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Workouts */}
        <Card hover className="relative overflow-hidden border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Тренувань
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {totalWorkouts}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Зафіксовано в журналі
          </div>
        </Card>

        {/* Card 2: Total Volume */}
        <Card hover className="relative overflow-hidden border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Тоннаж
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {totalVolumeTons} <span className="text-lg font-bold text-slate-400">т</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-indigo-400 font-semibold">
            <span>{totalVolumeKg.toLocaleString()} кг сумарно</span>
          </div>
        </Card>

        {/* Card 3: Personal Records */}
        <Card hover className="relative overflow-hidden border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Рекорди (PR)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {totalPrs}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-400 font-semibold">
            <span>Максимальні досягнення</span>
          </div>
        </Card>

        {/* Card 4: Catalog Size */}
        <Card hover className="relative overflow-hidden border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              База вправ
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {exercisesState.items.length}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-semibold">
            <span>Всі групи м'язів</span>
          </div>
        </Card>
      </div>

      {/* =========================================================================
          TODAY'S SCHEDULE & QUICK ACTIONS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column: Today's Exercises */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Тренування на сьогодні ({DAY_LABELS[currentDayKey]})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Програма: <strong>{activePlan?.name}</strong>
              </p>
            </div>

            <Link
              to="/plans"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              Змінити план <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {todayExercises.length === 0 ? (
            <Card className="border-border text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-200">
                На {DAY_LABELS[currentDayKey]} немає запланованих вправ
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Ви можете відкрити розклад і додати вправи на цей день або розпочати довільне заняття в будь-який момент.
              </p>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/plans')}>
                  Налаштувати розклад
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayExercises.map((pEx, idx) => {
                const ex = exerciseMap.get(pEx.exerciseId)
                return (
                  <div
                    key={pEx.id}
                    className="p-4 bg-slate-900/80 border border-slate-800/90 hover:border-purple-500/40 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                            {ex?.name || 'Вправа'}
                          </h4>
                          {ex && (
                            <Badge variant="primary" size="sm">
                              {MUSCLE_GROUP_LABELS[ex.primaryMuscle] || ex.primaryMuscle}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="font-semibold text-slate-300">
                            {pEx.sets} підходи × {pEx.reps} повторень
                          </span>
                          {pEx.weight ? (
                            <span>• {pEx.weight} кг</span>
                          ) : null}
                          <span>• {pEx.restSeconds}с відпочинок</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleStartTodayWorkout}
                        icon={<Play className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />}
                        className="text-xs"
                      >
                        Виконати
                      </Button>
                    </div>
                  </div>
                )
              })}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartTodayWorkout}
                  icon={<Play className="w-4 h-4 fill-white" />}
                  className="w-full"
                >
                  Розпочати все тренування ({todayExercises.length} вправ)
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Side Column: Quick Navigation & Coach Tip */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Швидкі дії
          </h2>

          <div className="space-y-3">
            <Link to="/exercises" className="block">
              <Card hover className="p-4 border-slate-800/80 bg-slate-900/80 flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                      Каталог вправ
                    </h3>
                    <p className="text-xs text-slate-400">Фільтри, техніка, поради</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </Card>
            </Link>

            <Link to="/progress" className="block">
              <Card hover className="p-4 border-slate-800/80 bg-slate-900/80 flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      Історія та аналітика
                    </h3>
                    <p className="text-xs text-slate-400">Журнал сесій та рекорди</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Card>
            </Link>

            <Link to="/profile" className="block">
              <Card hover className="p-4 border-slate-800/80 bg-slate-900/80 flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      Калькулятор ІМТ
                    </h3>
                    <p className="text-xs text-slate-400">Норми калорій та здоров'я</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </Card>
            </Link>

            {/* Coach Tip Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-indigo-950/40 border border-purple-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Порада тренера
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                «Прогресивне перевантаження (додавання ваги або повторень) — це головний драйвер зростання сили. Фіксуйте кожен підхід, щоб не тренуватися наосліп!»
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
