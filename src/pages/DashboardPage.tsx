import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, PlayCircle, Calendar, TrendingUp, Flame, Award, ArrowRight, CheckCircle2 } from 'lucide-react'
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

  useEffect(() => {
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

  const activePlan = plansState.plans.find((p) => p.id === plansState.activePlanId) || plansState.plans[0]
  const todayExercises = activePlan?.schedule[currentDayKey] || []

  // Exercise map
  const exerciseMap = React.useMemo(() => {
    const map = new Map<string, (typeof exercisesState.items)[0]>()
    exercisesState.items.forEach((e) => map.set(e.id, e))
    return map
  }, [exercisesState.items])

  const handleStartTodayWorkout = () => {
    if (todayExercises.length === 0) return
    dispatch(
      startWorkout({
        planId: activePlan?.id || null,
        dayLabel: `${DAY_LABELS[currentDayKey]} (${activePlan?.name})`,
        exercises: todayExercises,
      }),
    )
  }

  // Quick stats
  const totalWorkouts = progressState.history.length
  const totalVolume = progressState.history.reduce((a, b) => a + b.totalVolumeKg, 0)
  const totalPrs = Object.keys(progressState.personalRecords).length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-card to-indigo-950/40 border border-purple-500/20 p-6 sm:p-8">
        <div className="max-w-2xl relative z-10">
          <Badge variant="primary" size="sm" className="mb-3">
            {FITNESS_GOAL_LABELS[profile.fitnessGoal]}
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Привіт, <span className="gradient-text">{profile.name}</span>! 💪
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Сьогодні <strong>{DAY_LABELS[currentDayKey]}</strong>. Готові зробити ще один крок до
            поставленої мети? Почніть тренування за активною програмою або оберіть власну сесію.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            {session.isActive ? (
              <Link to="/workout">
                <Button variant="primary" size="lg" icon={<PlayCircle className="w-5 h-5" />}>
                  Продовжити активне тренування
                </Button>
              </Link>
            ) : todayExercises.length > 0 ? (
              <Link to="/workout">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartTodayWorkout}
                  icon={<PlayCircle className="w-5 h-5" />}
                >
                  Почати тренування на сьогодні
                </Button>
              </Link>
            ) : (
              <Link to="/workout">
                <Button variant="primary" size="lg" icon={<PlayCircle className="w-5 h-5" />}>
                  Почати довільне тренування
                </Button>
              </Link>
            )}

            <Link to="/plans">
              <Button variant="secondary" size="lg" icon={<Calendar className="w-4 h-4" />}>
                Мої плани
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/80">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Тренувань</span>
          </div>
          <span className="text-2xl font-black text-slate-100">{totalWorkouts}</span>
        </Card>

        <Card className="border-border/80">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Dumbbell className="w-4 h-4 text-purple-400" />
            <span>Загальний тоннаж</span>
          </div>
          <span className="text-2xl font-black text-slate-100">
            {(totalVolume / 1000).toFixed(1)} т
          </span>
        </Card>

        <Card className="border-border/80">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Особистих рекордів</span>
          </div>
          <span className="text-2xl font-black text-slate-100">{totalPrs}</span>
        </Card>

        <Card className="border-border/80">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Вправ у базі</span>
          </div>
          <span className="text-2xl font-black text-slate-100">{exercisesState.items.length}</span>
        </Card>
      </div>

      {/* Active Plan & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Розклад на сьогодні ({DAY_LABELS[currentDayKey]})
            </h3>
            <Link to="/plans" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold">
              Змінити план <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="border-border/80">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <div>
                <span className="text-xs text-slate-400 block">Активна програма:</span>
                <span className="text-base font-bold text-slate-100">{activePlan?.name || 'План не обрано'}</span>
              </div>
              <Badge variant="primary">{todayExercises.length} вправ сьогодні</Badge>
            </div>

            {todayExercises.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <p>Сьогодні день відпочинку або в програмі не вказано вправ на {DAY_LABELS[currentDayKey]}.</p>
                <p className="mt-1">Відпочиньте та відновіть сили або виберіть тренування самостійно!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayExercises.map((pEx, idx) => {
                  const ex = exerciseMap.get(pEx.exerciseId)
                  return (
                    <div
                      key={pEx.id}
                      className="p-3 bg-surface/60 rounded-xl border border-border/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-200 block">
                            {ex?.name || 'Вправа'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {pEx.sets} підходи • {pEx.reps} повторень {pEx.weight ? `• ${pEx.weight} кг` : ''}
                          </span>
                        </div>
                      </div>

                      <Badge variant="neutral" size="sm">
                        {pEx.restSeconds}с відп.
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Links / Tips */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Швидкі дії
          </h3>

          <div className="space-y-3">
            <Link to="/exercises" className="block">
              <Card hover className="p-4 border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Каталог вправ</h4>
                    <p className="text-xs text-slate-400">Техніка, фільтри, м'язи</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>

            <Link to="/progress" className="block">
              <Card hover className="p-4 border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Історія та аналітика</h4>
                    <p className="text-xs text-slate-400">Журнал занять та особисті рекорди</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>

            <Card className="p-4 bg-gradient-to-tr from-purple-900/30 to-slate-900/80 border-purple-500/30">
              <div className="flex items-center gap-2 mb-2 text-purple-300 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Порада дня
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Якісний сон тривалістю 7-8 годин та достатнє вживання білка (1.6-2.0 г на кг маси тіла)
                є критичними факторами для відновлення та росту м'язів!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
