import React from 'react'
import { Check, Edit, Trash2, Dumbbell, Play, Plus } from 'lucide-react'
import type { WorkoutPlan, DayOfWeek } from '../model/types'
import { ALL_DAYS, DAY_SHORT_LABELS, DAY_LABELS } from '../model/types'
import type { Exercise } from '@/features/exercises/model/types'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'

export interface PlanCardProps {
  plan: WorkoutPlan
  isActive: boolean
  allExercises: Exercise[]
  onSetActive: (planId: string) => void
  onEditDay: (planId: string, day: DayOfWeek) => void
  onDelete: (planId: string) => void
  onStartDayWorkout: (planId: string, day: DayOfWeek) => void
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isActive,
  allExercises,
  onSetActive,
  onEditDay,
  onDelete,
  onStartDayWorkout,
}) => {
  // Map exercise ID to name
  const exerciseMap = React.useMemo(() => {
    const map = new Map<string, Exercise>()
    allExercises.forEach((e) => map.set(e.id, e))
    return map
  }, [allExercises])

  // Count total exercises in plan
  const totalExercises = ALL_DAYS.reduce(
    (acc, day) => acc + (plan.schedule[day]?.length || 0),
    0,
  )

  const activeDaysCount = ALL_DAYS.filter(
    (day) => (plan.schedule[day]?.length || 0) > 0,
  ).length

  return (
    <Card className="flex flex-col justify-between border-slate-800/80 bg-slate-900/80 p-6 shadow-xl">
      <div>
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h3 className="text-xl font-black text-white">{plan.name}</h3>
              {isActive ? (
                <Badge variant="success" dot size="sm">
                  Активна програма
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">
                  {activeDaysCount} дні на тиждень
                </Badge>
              )}
            </div>
            {plan.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {plan.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {!isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetActive(plan.id)}
                icon={<Check className="w-3.5 h-3.5" />}
              >
                Зробити активною
              </Button>
            )}
            <button
              onClick={() => onDelete(plan.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
              title="Видалити план"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Schedule Grid */}
        <div className="mt-5 space-y-2.5">
          {ALL_DAYS.map((day) => {
            const dayExercises = plan.schedule[day] || []
            const hasExercises = dayExercises.length > 0

            return (
              <div
                key={day}
                className={`p-3.5 rounded-2xl border transition-all ${
                  hasExercises
                    ? 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700'
                    : 'bg-slate-950/20 border-dashed border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                        hasExercises
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-950/40 border border-sky-400/20'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {DAY_SHORT_LABELS[day]}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-slate-100 block sm:inline">
                        {DAY_LABELS[day]}
                      </span>
                      <span className="text-xs text-slate-400 sm:ml-2">
                        {hasExercises ? `(${dayExercises.length} вправ)` : '— Відпочинок'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasExercises && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onStartDayWorkout(plan.id, day)}
                        icon={<Play className="w-3.5 h-3.5 fill-white" />}
                        className="text-xs"
                      >
                        Старт
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditDay(plan.id, day)}
                      icon={hasExercises ? <Edit className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      {hasExercises ? 'Змінити' : 'Додати'}
                    </Button>
                  </div>
                </div>

                {/* Day Exercise preview chips */}
                {hasExercises && (
                  <div className="mt-3 flex flex-wrap gap-2 pl-11">
                    {dayExercises.map((pEx) => {
                      const ex = exerciseMap.get(pEx.exerciseId)
                      return (
                        <span
                          key={pEx.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm"
                        >
                          <Dumbbell className="w-3 h-3 text-sky-400" />
                          <strong className="text-slate-200">{ex ? ex.name : 'Вправа'}:</strong>
                          <span>
                            {pEx.sets}×{pEx.reps}
                            {pEx.weight ? ` (${pEx.weight} кг)` : ''}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>Тренувальних днів на тиждень: <strong className="text-slate-200">{activeDaysCount}</strong></span>
        <span>Всього вправ у програмі: <strong className="text-slate-200">{totalExercises}</strong></span>
      </div>
    </Card>
  )
}
