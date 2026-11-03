import { cn } from '@/shared/lib/cn'
import type { TechniqueStep } from '../../model/types'

interface StepListProps {
  steps: TechniqueStep[]
  /** Highlighted step; omit for a plain list */
  active?: number
  onSelect?: (index: number) => void
}

export function StepList({ steps, active, onSelect }: StepListProps) {
  return (
    <ol className="space-y-1.5">
      {steps.map((step, i) => {
        const isActive = i === active
        const content = (
          <>
            <span
              className={cn(
                'mt-px flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-colors',
                isActive ? 'border-accent text-accent' : 'border-line-strong text-fg-subtle',
              )}
            >
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-fg">{step.title}</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-fg-muted">{step.text}</span>
            </span>
          </>
        )
        const rowClass = cn(
          'flex w-full gap-3 rounded-md border px-3 py-3 text-left transition-colors',
          isActive ? 'border-accent/60 bg-surface-2' : 'border-transparent',
        )
        return (
          <li key={i}>
            {onSelect ? (
              <button type="button" onClick={() => onSelect(i)} aria-current={isActive ? 'step' : undefined} className={cn(rowClass, 'cursor-pointer hover:bg-surface-2')}>
                {content}
              </button>
            ) : (
              <div className={rowClass}>{content}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
