import { useId, useMemo } from 'react'
import { Check, ChevronDown, Pencil, Play, Plus, Trash2 } from 'lucide-react'
import { Badge, Button, IconButton } from '@/shared/ui'
import type { Exercise } from '@/features/exercises/model/types'
import { cn } from '@/shared/lib/cn'
import type { DayOfWeek, WorkoutPlan } from '../model/types'
import { ALL_DAYS, DAY_LABELS, DAY_SHORT_LABELS } from '../model/types'

export interface PlanCardProps {
  plan: WorkoutPlan
  isActive: boolean
  expanded: boolean
  onToggle: () => void
  allExercises: Exercise[]
  onSetActive: (planId: string) => void
  onEdit: () => void
  onEditDay: (planId: string, day: DayOfWeek) => void
  onDelete: (planId: string) => void
  onStartDayWorkout: (planId: string, day: DayOfWeek) => void
}

export function PlanCard({
  plan,
  isActive,
  expanded,
  onToggle,
  allExercises,
  onSetActive,
  onEdit,
  onEditDay,
  onDelete,
  onStartDayWorkout,
}: PlanCardProps) {
  const panelId = useId()
  const exerciseMap = useMemo(() => new Map(allExercises.map((e) => [e.id, e])), [allExercises])
  const trainingDays = ALL_DAYS.filter((day) => (plan.schedule[day]?.length || 0) > 0)
  const totalExercises = ALL_DAYS.reduce((sum, day) => sum + (plan.schedule[day]?.length || 0), 0)

  return (
    <article className={cn('rounded-lg border bg-surface transition-colors', isActive ? 'border-accent/50' : 'border-line')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-start gap-4 p-4 text-left sm:p-5"
      >
        <span className="min-w-0 flex-1 space-y-2">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-fg">{plan.name}</span>
            {isActive && (
              <Badge variant="primary" size="sm" dot>
                Активна
              </Badge>
            )}
          </span>
          {plan.description && <span className="line-clamp-1 text-sm text-fg-muted">{plan.description}</span>}
          <span className="flex items-center gap-3">
            <span className="flex gap-1" aria-hidden="true">
              {ALL_DAYS.map((day) => (
                <span
                  key={day}
                  className={cn(
                    'h-1.5 w-4 rounded-full',
                    (plan.schedule[day]?.length || 0) > 0 ? 'bg-fg-muted' : 'bg-line',
                  )}
                />
              ))}
            </span>
            <span className="text-xs text-fg-subtle">
              {trainingDays.length} дні · {totalExercises} вправ
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn('mt-0.5 size-5 shrink-0 text-fg-subtle transition-transform duration-200', expanded && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div id={panelId} className="border-t border-line">
          <ul className="divide-y divide-line">
            {ALL_DAYS.map((day) => {
              const dayExercises = plan.schedule[day] || []
              const hasExercises = dayExercises.length > 0
              return (
                <li key={day} className="px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold',
                        hasExercises ? 'bg-surface-2 text-fg' : 'text-fg-subtle',
                      )}
                    >
                      {DAY_SHORT_LABELS[day]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-sm font-medium', hasExercises ? 'text-fg' : 'text-fg-subtle')}>
                        {DAY_LABELS[day]}
                      </span>
                      <span className="block truncate text-xs text-fg-subtle">
                        {hasExercises
                          ? dayExercises.map((pEx) => exerciseMap.get(pEx.exerciseId)?.name || 'Вправа').join(', ')
                          : 'Відпочинок'}
                      </span>
                    </span>
                    <IconButton
                      size="sm"
                      label={hasExercises ? `Змінити ${DAY_LABELS[day].toLowerCase()}` : `Додати вправи на ${DAY_LABELS[day].toLowerCase()}`}
                      icon={hasExercises ? <Pencil /> : <Plus />}
                      onClick={() => onEditDay(plan.id, day)}
                    />
                    {hasExercises && (
                      <IconButton
                        size="sm"
                        label={`Почати тренування: ${DAY_LABELS[day].toLowerCase()}`}
                        icon={<Play className="fill-current" />}
                        onClick={() => onStartDayWorkout(plan.id, day)}
                        className="bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent"
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3 sm:px-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(plan.id)}
              icon={<Trash2 />}
              className="text-danger hover:bg-danger-soft hover:text-danger"
            >
              Видалити
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onEdit} icon={<Pencil />}>
                Перейменувати
              </Button>
              {!isActive && (
                <Button variant="outline" size="sm" onClick={() => onSetActive(plan.id)} icon={<Check />}>
                  Зробити активною
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
