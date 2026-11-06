import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton, statusStyles } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatHoursMinutes, formatNumber } from '@/shared/lib/formatters'
import { monthCalendar } from '../lib/journal'
import type { WorkoutHistoryLog } from '../model/types'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const monthTitle = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' })
const dayTitle = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' })

interface JournalCalendarProps {
  month: Date
  history: WorkoutHistoryLog[]
  onMonthChange: (month: Date) => void
  onSelectDay: (log: WorkoutHistoryLog) => void
}

export function JournalCalendar({ month, history, onMonthChange, onSelectDay }: JournalCalendarProps) {
  const [today] = useState(() => new Date().toDateString())
  const weeks = monthCalendar(month.getFullYear(), month.getMonth(), history)
  const inMonth = weeks.flat().filter((day) => day.inMonth)
  const logs = inMonth.flatMap((day) => day.logs)
  const volume = logs.reduce((sum, log) => sum + log.totalVolumeKg, 0)
  const seconds = logs.reduce((sum, log) => sum + log.durationSeconds, 0)
  const shift = (delta: number) => onMonthChange(new Date(month.getFullYear(), month.getMonth() + delta, 1))

  return (
    <section aria-label="Календар тренувань" className="rounded-lg border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-semibold normal-case tracking-normal text-fg first-letter:uppercase">{monthTitle.format(month)}</h2>
        <div className="-mr-2 flex">
          <IconButton size="sm" label="Попередній місяць" icon={<ChevronLeft />} onClick={() => shift(-1)} />
          <IconButton size="sm" label="Наступний місяць" icon={<ChevronRight />} onClick={() => shift(1)} />
        </div>
      </div>

      <div role="grid" className="mt-4 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <div key={day} role="columnheader" className="pb-1 text-[11px] font-semibold text-fg-subtle">
            {day}
          </div>
        ))}
        {weeks.flat().map((day) => {
          const trained = day.logs.length > 0
          const isToday = day.date.toDateString() === today
          const label = `${dayTitle.format(day.date)}${trained ? `: ${day.logs.length} тренув.` : ''}`
          const content = (
            <>
              {day.date.getDate()}
              {day.logs.length > 1 && <span className="absolute right-1 top-0.5 text-[9px] leading-none">{day.logs.length}</span>}
            </>
          )
          const base = 'relative flex h-9 items-center justify-center rounded-md border font-mono text-sm tabular'
          if (!day.inMonth) {
            return (
              <div key={day.date.toISOString()} role="gridcell" aria-hidden="true" className={cn(base, 'border-transparent text-fg-subtle/40')}>
                {day.date.getDate()}
              </div>
            )
          }
          return trained ? (
            <button
              key={day.date.toISOString()}
              type="button"
              role="gridcell"
              aria-label={label}
              onClick={() => onSelectDay(day.logs[0])}
              className={cn(base, 'cursor-pointer font-semibold transition-colors hover:brightness-110', statusStyles.done)}
            >
              {content}
            </button>
          ) : (
            <div key={day.date.toISOString()} role="gridcell" aria-label={label} className={cn(base, isToday ? statusStyles.current : 'border-transparent text-fg-muted')}>
              {content}
            </div>
          )
        })}
      </div>

      <dl className="mt-4 grid grid-cols-3 border-t border-line pt-4 text-center">
        {[
          ['Тренувань', String(logs.length)],
          ['Тоннаж', `${formatNumber(volume / 1000, 1)} т`],
          ['Час', formatHoursMinutes(seconds)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">{label}</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-fg tabular">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
