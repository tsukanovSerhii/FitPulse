import { useId } from 'react'
import { Minus, Plus } from 'lucide-react'

export interface NumberStepperProps {
  label: string
  value: number
  onChange: (value: number) => void
  step: number
  min?: number
  max?: number
  unit?: string
  decimals?: number
}

const round = (value: number, decimals: number) => Number(value.toFixed(decimals))

export function NumberStepper({ label, value, onChange, step, min = 0, max = 999, unit, decimals = 0 }: NumberStepperProps) {
  const id = useId()
  const clamp = (v: number) => Math.min(max, Math.max(min, round(v, decimals)))

  const buttonClass =
    'flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-md bg-surface-2 text-fg transition-colors active:bg-line-strong disabled:opacity-40'

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-center text-xs font-semibold uppercase tracking-[0.16em] text-fg-subtle">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${label}: мінус ${step}`}
          className={buttonClass}
          disabled={value <= min}
          onClick={() => onChange(clamp(value - step))}
        >
          <Minus className="size-5" />
        </button>
        <div className="relative min-w-0 flex-1">
          <input
            id={id}
            type="number"
            inputMode={decimals > 0 ? 'decimal' : 'numeric'}
            value={Number.isFinite(value) ? value : ''}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(e.target.value === '' ? min : clamp(Number(e.target.value)))}
            className="h-14 w-full rounded-md border border-line bg-transparent text-center font-mono text-3xl font-semibold text-fg tabular focus:border-accent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {unit && (
            <span className="pointer-events-none absolute bottom-1.5 right-2 text-[10px] font-semibold uppercase text-fg-subtle">
              {unit}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={`${label}: плюс ${step}`}
          className={buttonClass}
          disabled={value >= max}
          onClick={() => onChange(clamp(value + step))}
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  )
}
