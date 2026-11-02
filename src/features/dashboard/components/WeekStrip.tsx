import { Check } from 'lucide-react'
import { DAY_LABELS, DAY_SHORT_LABELS, type DayOfWeek } from '@/features/workoutPlan/model/types'
import { cn } from '@/utils/cn'
import { WEEK_DAYS } from '../lib/week'
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
                done && 'border-accent bg-accent text-on-accent',
                !done && planned && 'border-line-strong text-fg',
                !done && !planned && 'border-line text-fg-subtle',
                day === today && !done && 'border-accent text-accent',
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
