import { Check, Minus, Plus } from 'lucide-react'
import { BackBody } from '@/features/exercises/components/muscle-map/BackBody'
import { FrontBody } from '@/features/exercises/components/muscle-map/FrontBody'
import { createMusclePaint } from '@/features/exercises/components/muscle-map/paint'
import { ProgressRing } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

const chestPaint = createMusclePaint('chest', ['chest', 'triceps', 'shoulders'])

export function AnatomyVisual() {
  return (
    <div aria-hidden="true" className="flex items-center gap-4 sm:gap-6">
      <FrontBody paint={chestPaint} className="h-56 w-28 sm:h-72 sm:w-36" />
      <BackBody paint={chestPaint} className="h-56 w-28 sm:h-72 sm:w-36" />
    </div>
  )
}

export function StepperVisual() {
  return (
    <div aria-hidden="true" className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex size-12 items-center justify-center rounded-md bg-surface-2 text-fg">
          <Minus className="size-5" />
        </span>
        <span className="flex h-12 flex-1 items-center justify-center rounded-md border border-line font-mono text-3xl text-fg">72,5</span>
        <span className="flex size-12 items-center justify-center rounded-md bg-surface-2 text-fg">
          <Plus className="size-5" />
        </span>
      </div>
      <div className="flex h-12 items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold uppercase text-on-accent">
        <Check className="size-4" /> Записати підхід
      </div>
    </div>
  )
}

export function RestVisual() {
  return (
    <div aria-hidden="true" className="flex justify-center">
      <ProgressRing value={40} label="" size={128} stroke={5}>
        <span className="font-mono text-3xl font-semibold text-fg">1:12</span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-fg-subtle">відпочинок</span>
      </ProgressRing>
    </div>
  )
}

const WEEK = [
  { day: 'Пн', name: 'Push', on: true },
  { day: 'Вт', name: '', on: false },
  { day: 'Ср', name: 'Pull', on: true },
  { day: 'Чт', name: '', on: false },
  { day: 'Пт', name: 'Legs', on: true },
  { day: 'Сб', name: '', on: false },
  { day: 'Нд', name: '', on: false },
]

export function WeekVisual() {
  return (
    <div aria-hidden="true" className="w-full space-y-3">
      <ol className="grid grid-cols-7 gap-1.5">
        {WEEK.map((d) => (
          <li
            key={d.day}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1 rounded-md border text-xs font-semibold',
              d.on ? 'border-accent/40 bg-accent-soft text-fg' : 'border-line text-fg-subtle',
            )}
          >
            {d.day}
            <span className={cn('size-1 rounded-full', d.on ? 'bg-accent' : 'bg-transparent')} />
          </li>
        ))}
      </ol>
      <p className="flex flex-wrap gap-1.5">
        {WEEK.filter((d) => d.on).map((d) => (
          <span key={d.day} className="rounded-sm bg-surface-2 px-2 py-1 font-mono text-[11px] text-fg-muted">
            {d.day} · <span className="text-fg">{d.name}</span>
          </span>
        ))}
      </p>
    </div>
  )
}

const VOLUME = [42, 55, 48, 63, 58, 71, 80, 76]

export function ProgressVisual() {
  const max = Math.max(...VOLUME)
  return (
    <div aria-hidden="true" className="flex h-28 w-full items-end gap-2">
      {VOLUME.map((v, i) => (
        <span
          key={i}
          className={cn('flex-1 rounded-t-sm', i === VOLUME.length - 2 ? 'bg-accent' : 'bg-line-strong')}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  )
}
