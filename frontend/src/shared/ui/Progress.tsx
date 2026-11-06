import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const clamp = (value: number) => Math.min(100, Math.max(0, value))

export interface ProgressBarProps {
  value: number
  label: string
  tone?: 'accent' | 'success' | 'danger'
  className?: string
}

const tones = { accent: 'bg-accent', success: 'bg-success', danger: 'bg-danger' }

export function ProgressBar({ value, label, tone = 'accent', className }: ProgressBarProps) {
  const v = clamp(value)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1 w-full overflow-hidden rounded-full bg-line', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tones[tone])} style={{ width: `${v}%` }} />
    </div>
  )
}

export interface ProgressRingProps {
  value: number
  label: string
  size?: number
  stroke?: number
  children?: ReactNode
  className?: string
}

export function ProgressRing({ value, label, size = 160, stroke = 6, children, className }: ProgressRingProps) {
  const v = clamp(value)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v / 100)}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>}
    </div>
  )
}
