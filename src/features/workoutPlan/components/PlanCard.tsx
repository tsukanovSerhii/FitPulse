import React from 'react'
import { Check, Edit, Trash2, Dumbbell, PlayCircle, Plus } from 'lucide-react'
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
    <Card className="flex flex-col justify-between border-border/80">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-100">{plan.name}</h3>
              {isActive && (
                <Badge variant="success" size="sm">
                  Активна програма
                </Badge>
              )}
            </div>
            {plan.description && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {plan.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetActive(plan.id)}
                icon={<Check className="w-3.5 h-3.5" />}
                title="Зробити активною"
              >
                Активувати
              </Button>
            )}
            <button
              onClick={() => onDelete(plan.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Видалити план"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Schedule */}
        <div className="mt-4 space-y-2.5">
          {ALL_DAYS.map((day) => {
            const dayExercises = plan.schedule[day] || []
            const hasExercises = dayExercises.length > 0

            return (
              <div
                key={day}
                className={`p-3 rounded-xl border transition-all ${
                  hasExercises
                    ? 'bg-surface/70 border-border/80'
                    : 'bg-surface/20 border-dashed border-border/40 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        hasExercises
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {DAY_SHORT_LABELS[day]}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {DAY_LABELS[day]}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({dayExercises.length} вправ)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasExercises && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onStartDayWorkout(plan.id, day)}
                        icon={<PlayCircle className="w-3.5 h-3.5" />}
                        className="py-1 px-2.5 text-xs"
                      >
                        Старт
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditDay(plan.id, day)}
                      icon={hasExercises ? <Edit className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      className="py-1 px-2 text-xs"
                    >
                      {hasExercises ? 'Змінити' : 'Додати'}
                    </Button>
                  </div>
                </div>

                {/* Day Exercise preview chips */}
                {hasExercises && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 pl-9">
                    {dayExercises.map((pEx) => {
                      const ex = exerciseMap.get(pEx.exerciseId)
                      return (
                        <span
                          key={pEx.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-[11px] text-slate-300 border border-purple-500/20"
                        >
                          <Dumbbell className="w-2.5 h-2.5 text-purple-400" />
                          {ex ? ex.name : 'Вправа'}: {pEx.sets}x{pEx.reps}
                          {pEx.weight ? ` (${pEx.weight} кг)` : ''}
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
      <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-slate-400">
        <span>Тренувальних днів на тиждень: <strong>{activeDaysCount}</strong></span>
        <span>Всього заплановано вправ: <strong>{totalExercises}</strong></span>
      </div>
    </Card>
  )
}
