import React from 'react'
import { Check, Edit, Trash2, Play, Plus } from 'lucide-react'
import type { WorkoutPlan, DayOfWeek } from '../model/types'
import { ALL_DAYS, DAY_SHORT_LABELS, DAY_LABELS } from '../model/types'
import type { Exercise } from '@/features/exercises/model/types'
import { Card } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'

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
    <Card className="flex flex-col justify-between p-6">
      <div>
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h3 className="text-xl font-black text-fg">{plan.name}</h3>
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
              <p className="text-xs sm:text-sm text-fg-muted leading-relaxed max-w-2xl">
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
              className="p-2 rounded-md text-fg-muted hover:text-danger hover:bg-danger-soft border border-transparent hover:border-danger transition-all cursor-pointer"
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
                className={`p-3.5 rounded-lg border transition-all ${
                  hasExercises
                    ? 'bg-surface-2 border-line hover:border-accent/30'
                    : 'bg-surface-2/50 border-dashed border-line/50 opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-md text-xs font-black flex items-center justify-center shrink-0 ${
                        hasExercises
                          ? 'bg-accent text-on-accent border border-accent/20'
                          : 'bg-surface-2 text-fg-subtle border border-line'
                      }`}
                    >
                      {DAY_SHORT_LABELS[day]}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-fg block sm:inline">
                        {DAY_LABELS[day]}
                      </span>
                      <span className="text-xs text-fg-subtle sm:ml-2">
                        {hasExercises ? `(${dayExercises.length} вправ)` : '— Відпочинок'}
                      </span>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {hasExercises && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onStartDayWorkout(plan.id, day)}
                        icon={<Play className="w-3.5 h-3.5 fill-current" />}
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
                  <div className="mt-3 flex flex-wrap gap-2 sm:pl-11">
                    {dayExercises.map((pEx) => {
                      const ex = exerciseMap.get(pEx.exerciseId)
                      return (
                        <span
                          key={pEx.id}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-sm border border-line px-2.5 py-1 text-xs text-fg-muted"
                        >
                          <span className="truncate font-medium text-fg">{ex ? ex.name : 'Вправа'}</span>
                          <span className="shrink-0 font-mono tabular text-fg-subtle">
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
      <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs text-fg-subtle font-medium">
        <span>Тренувальних днів на тиждень: <strong className="text-fg-muted">{activeDaysCount}</strong></span>
        <span>Всього вправ у програмі: <strong className="text-fg-muted">{totalExercises}</strong></span>
      </div>
    </Card>
  )
}
