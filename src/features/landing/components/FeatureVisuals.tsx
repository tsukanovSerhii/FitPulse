import { Check, Minus, Plus } from 'lucide-react'
import { BackBody } from '@/components/common/muscle-map/BackBody'
import { FrontBody } from '@/components/common/muscle-map/FrontBody'
import { createMusclePaint } from '@/components/common/muscle-map/paint'
import { ProgressRing } from '@/components/ui'
import { cn } from '@/utils/cn'

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
    <ol aria-hidden="true" className="grid w-full grid-cols-7 gap-1.5">
      {WEEK.map((d) => (
        <li
          key={d.day}
          className={cn(
            'flex h-20 flex-col items-center justify-between rounded-md border py-3 text-xs font-semibold',
            d.on ? 'border-accent/40 bg-accent-soft text-fg' : 'border-line text-fg-subtle',
          )}
        >
          {d.day}
          <span className={cn('font-display text-sm uppercase', d.on ? 'text-accent' : 'text-transparent')}>{d.name || '·'}</span>
        </li>
      ))}
    </ol>
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
