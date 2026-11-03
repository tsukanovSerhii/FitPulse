import { Check } from 'lucide-react'
import { DAY_LABELS, DAY_SHORT_LABELS, type DayOfWeek, WEEK_DAYS } from '@/features/workoutPlan'
import { statusStyles } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { DashboardSection } from './DashboardSection'

interface WeekStripProps {
  today: DayOfWeek
  doneDays: Set<DayOfWeek>
  isPlanned: (day: DayOfWeek) => boolean
  plannedCount: number
}

export function WeekStrip({ today, doneDays, isPlanned, plannedCount }: WeekStripProps) {
  return (
    <DashboardSection
      title="Цей тиждень"
      aside={
        <span className="font-mono text-xs text-fg-subtle tabular">
          {doneDays.size} / {plannedCount}
        </span>
      }
    >
      <ol className="grid grid-cols-7 gap-1.5">
        {WEEK_DAYS.map((day) => {
          const planned = isPlanned(day)
          const done = doneDays.has(day)
          return (
            <li
              key={day}
              aria-label={`${DAY_LABELS[day]}: ${done ? 'виконано' : planned ? 'заплановано' : 'відпочинок'}`}
              className={cn(
                'flex h-14 flex-col items-center justify-center gap-1 rounded-md border text-xs font-semibold sm:h-16',
                done
                  ? statusStyles.done
                  : day === today
                    ? statusStyles.current
                    : planned
                      ? statusStyles.planned
                      : statusStyles.idle,
              )}
            >
              {DAY_SHORT_LABELS[day]}
              {done ? (
                <Check className="size-3" aria-hidden="true" />
              ) : (
                <span className={cn('size-1 rounded-full', planned ? 'bg-current' : 'bg-transparent')} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </DashboardSection>
  )
}
