import type { ReactNode } from 'react'
import { Wind } from 'lucide-react'
import type { MovementPhase } from '@/features/exercises/model/types'
import { cn } from '@/utils/cn'
import { BREATHING_LABELS } from './movement'

export function Stage({ caption, tempo, children }: { caption: ReactNode; tempo: string; children: ReactNode }) {
  return (
    <div className="relative flex h-60 items-center justify-center overflow-hidden rounded-lg border border-line bg-bg p-3 sm:h-72">
      {children}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-line bg-surface/90 px-3 py-1.5 text-xs">
        <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
        {caption}
      </div>
      <div className="absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-md border border-line bg-surface/90 px-3 py-1.5 text-xs sm:flex">
        <span className="text-fg-muted">Темп:</span>
        <strong className="font-mono text-accent">{tempo}</strong>
      </div>
    </div>
  )
}

export interface Step {
  title: string
  description?: string
}

export function StepPicker({
  steps,
  active,
  onSelect,
  className,
}: {
  steps: Step[]
  active: number
  onSelect: (index: number) => void
  className?: string
}) {
  return (
    <div className={cn('grid gap-2', className)}>
      {steps.map((step, i) => {
        const isActive = i === active
        return (
          <button
            key={i}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(i)}
            className={cn(
              'cursor-pointer rounded-lg border p-2.5 text-left transition-colors',
              isActive ? 'border-accent/40 bg-accent-soft' : 'border-line bg-surface-2 hover:border-line-strong',
            )}
          >
            <span className={cn('block text-[10px] font-bold uppercase tracking-wider', isActive ? 'text-accent' : 'text-fg-subtle')}>
              Крок {i + 1}
            </span>
            <span className="mt-0.5 block truncate text-xs font-semibold text-fg">{step.title}</span>
            {step.description && <span className="mt-0.5 block truncate text-[11px] text-fg-muted">{step.description}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function PhaseDetails({ phase, tempo }: { phase: MovementPhase; tempo: string }) {
  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface-2 p-4">
      <div>
        <h5 className="mb-1 text-sm font-bold text-fg">{phase.name}</h5>
        <p className="text-xs leading-relaxed text-fg-muted">{phase.instruction}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2 text-xs">
        <p className="text-fg-muted">
          <span className="font-bold text-accent">Фокус:</span> <span className="italic">«{phase.cue}»</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
            <Wind className="size-3" aria-hidden="true" />
            {BREATHING_LABELS[phase.breathing]}
          </span>
          <span className="hidden font-mono text-[11px] text-fg-muted sm:inline">{tempo} сек</span>
        </div>
      </div>
    </div>
  )
}
