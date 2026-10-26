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
      title: 'FitPulse — Щоденник та планувальник силових тренувань',
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
          HERO BANNER — Minimalist Clean Style
      ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-[#121622] border border-white/[0.08] p-6 sm:p-10 shadow-2xl">
        {/* Subtle sports accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" dot size="sm">
                {FITNESS_GOAL_LABELS[profile.fitnessGoal]}
              </Badge>
              <span className="text-xs font-bold text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {DAY_LABELS[currentDayKey]}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Привіт, <span className="text-sky-400">{profile.name}</span>!
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-medium">
              Сьогодні день твого прогресу. Дотримуйся плану, фіксуй вагу та нарощуй силу без компромісів.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              {session.isActive ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/workout')}
                  icon={<Play className="w-5 h-5 fill-slate-950" />}
                  className="animate-pulse"
                >
                  Продовжити тренування
                </Button>
              ) : todayExercises.length > 0 ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartTodayWorkout}
                  icon={<Play className="w-5 h-5 fill-slate-950" />}
                >
                  Почати сьогодні ({todayExercises.length} вправ)
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/workout')}
                  icon={<Play className="w-5 h-5 fill-slate-950" />}
                >
                  Почати тренування
                </Button>
              )}

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/plans')}
                icon={<Calendar className="w-4 h-4 text-sky-400" />}
              >
                Мої програми
              </Button>
            </div>
          </div>

          {/* Right Hero Card: Status Widget */}
          <div className="lg:col-span-5">
            <div className="bg-[#090d16] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Сьогоднішній графік
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {activePlan ? activePlan.name : 'Без плану'}
                </span>
              </div>

              {todayExercises.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-heading font-black text-white">
                      {todayExercises.length}
                    </span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      вправ заплановано
                    </span>
                  </div>

                  {/* Exercise preview pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {todayExercises.slice(0, 3).map((pEx) => {
                      const ex = exerciseMap.get(pEx.exerciseId)
                      return (
                        <span
                          key={pEx.id}
                          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-200"
                        >
                          {ex ? ex.name : 'Вправа'}
                        </span>
                      )
                    })}
                    {todayExercises.length > 3 && (
                      <span className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs font-black text-sky-300">
                        +{todayExercises.length - 3} ще
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      ~50-60 хвилин
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Flame className="w-4 h-4" />
                      ~400 ккал
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-sm font-bold text-white">
                    Сьогодні день відновлення 🧘‍♂️
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
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
        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Тренувань
            </span>
            <div className="w-9 h-9 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-black text-white">
            {totalWorkouts}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-sky-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Зафіксовано в залі
          </div>
        </Card>

        {/* Card 2: Total Volume */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Тоннаж
            </span>
            <div className="w-9 h-9 rounded-2xl bg-sky-400/15 border border-sky-400/30 text-sky-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-black text-white">
            {totalVolumeTons} <span className="text-lg font-bold text-slate-400">т</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-sky-400 font-bold">
            <span>{totalVolumeKg.toLocaleString()} кг піднято</span>
          </div>
        </Card>

        {/* Card 3: Personal Records */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Рекорди (PR)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-black text-white">
            {totalPrs}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400 font-bold">
            <span>Особисті максимуми</span>
          </div>
        </Card>

        {/* Card 4: Catalog Size */}
        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              База вправ
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-black text-white">
            {exercisesState.items.length}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-bold">
            <span>Всі м'язові групи</span>
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
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                План на сьогодні ({DAY_LABELS[currentDayKey]})
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Програма: <strong className="text-white">{activePlan?.name}</strong>
              </p>
            </div>

            <Link
              to="/plans"
              className="text-xs font-black text-sky-400 hover:underline flex items-center gap-1 transition-all"
            >
              Змінити план <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {todayExercises.length === 0 ? (
            <Card className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-200">
                На {DAY_LABELS[currentDayKey]} немає запланованих вправ
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Ви можете відкрити розклад і призначити вправи або розпочати вільне тренування.
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
                    className="p-4 sm:p-5 bg-[#121622] border border-white/[0.07] hover:border-sky-500/40 rounded-3xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-300 font-heading font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                            {ex?.name || 'Вправа'}
                          </h4>
                          {ex && (
                            <Badge variant="primary" size="sm">
                              {MUSCLE_GROUP_LABELS[ex.primaryMuscle] || ex.primaryMuscle}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-semibold mt-1">
                          <span className="text-slate-200">
                            {pEx.sets} підходи × {pEx.reps} повт
                          </span>
                          {pEx.weight ? <span>• {pEx.weight} кг</span> : null}
                          <span>• {pEx.restSeconds}с відп.</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleStartTodayWorkout}
                        icon={<Play className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />}
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
                  icon={<Play className="w-4 h-4 fill-slate-950" />}
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
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            Швидкі дії
          </h2>

          <div className="space-y-3">
            <Link to="/exercises" className="block">
              <Card hover className="p-4 sm:p-5 flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                      Каталог вправ
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Анатомія, техніка, поради</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
              </Card>
            </Link>

            <Link to="/progress" className="block">
              <Card hover className="p-4 sm:p-5 flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-sky-400/15 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      Історія та аналітика
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Журнал сесій та рекорди</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
              </Card>
            </Link>

            <Link to="/profile" className="block">
              <Card hover className="p-4 sm:p-5 flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Калькулятор ІМТ
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Норми калорій та здоров'я</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </Card>
            </Link>

            {/* Coach Quote Card */}
            <div className="p-6 rounded-3xl bg-[#121622] border border-white/10 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-sky-400 font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Порада тренера
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                «Ніколи не пропускайте розминку та контролюйте ексцентричну фазу (опускання 2-3 секунди). Тільки чиста біомеханіка будує здорове та міцне тіло!»
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
