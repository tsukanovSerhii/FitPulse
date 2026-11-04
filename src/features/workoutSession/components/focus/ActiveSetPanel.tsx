import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button, NumberStepper } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/formatters'
import { BAR_KG, estimateOneRepMax, platesPerSide } from '../../lib/strength'

export interface SetExtras {
  kind?: 'drop' | 'failure'
  rpe?: number
}

interface ActiveSetPanelProps {
  setNumber: number
  initialWeight?: number
  initialReps: number
  showWeight: boolean
  /** Barbell lifts also show which plates to load */
  barbell?: boolean
  /** Warm-up sets are logged without a type or RPE */
  warmup?: { number: number; total: number }
  onDone: (weight: number | undefined, reps: number, extras: SetExtras) => void
}

const KIND_OPTIONS = [
  { value: undefined, label: 'Робочий' },
  { value: 'drop', label: 'Дроп-сет' },
  { value: 'failure', label: 'До відмови' },
] as const

const RPE_OPTIONS = [7, 8, 9, 10]

function Chip({ selected, onClick, label, children }: { selected: boolean; onClick: () => void; label?: string; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'h-8 shrink-0 cursor-pointer rounded-md border px-2.5 text-xs font-semibold transition-colors',
        selected ? 'border-fg bg-fg text-bg' : 'border-line text-fg-muted hover:text-fg',
      )}
    >
      {children}
    </button>
  )
}

function LoadHints({ weight, reps, barbell }: { weight: number; reps: number; barbell: boolean }) {
  const oneRepMax = estimateOneRepMax(weight, reps)
  const { plates, remainder } = platesPerSide(weight)
  if (!oneRepMax && !barbell) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-fg-subtle">
      {barbell && weight >= BAR_KG && (
        <span className="flex flex-wrap items-center gap-1.5" aria-label={`На кожен бік: ${plates.join(', ') || 'нічого'} кг`}>
          На бік:
          {plates.length === 0 ? (
            <span className="text-fg-muted">порожній гриф</span>
          ) : (
            plates.map((plate, i) => (
              <span key={i} className="rounded-sm border border-line-strong px-1.5 py-0.5 font-mono text-fg-muted tabular">
                {formatNumber(plate, 2)}
              </span>
            ))
          )}
          {remainder > 0 && <span className="text-warning">+{formatNumber(remainder, 2)} кг не набрати</span>}
        </span>
      )}
      {oneRepMax && (
        <span>
          1ПМ ≈ <span className="font-mono text-fg-muted tabular">{formatNumber(oneRepMax, 1)} кг</span>
        </span>
      )}
    </div>
  )
}

/** Current set editor. Its key changes after every set, which resets the draft values. */
export function ActiveSetPanel({ setNumber, initialWeight, initialReps, showWeight, barbell = false, warmup, onDone }: ActiveSetPanelProps) {
  const [weight, setWeight] = useState(initialWeight ?? 0)
  const [reps, setReps] = useState(initialReps)
  const [kind, setKind] = useState<SetExtras['kind']>()
  const [rpe, setRpe] = useState<number>()

  return (
    <div className="space-y-3">
      <div className={cn('grid gap-4', showWeight && 'sm:grid-cols-2')}>
        {showWeight && <NumberStepper label="Вага" unit="кг" value={weight} onChange={setWeight} step={2.5} max={500} decimals={1} />}
        <NumberStepper label="Повтори" value={reps} onChange={setReps} step={1} min={1} max={100} />
      </div>
      {showWeight && <LoadHints weight={weight} reps={reps} barbell={barbell} />}
      {!warmup && (
        <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]" role="group" aria-label="Тип підходу й RPE">
          {KIND_OPTIONS.map((option) => (
            <Chip key={option.label} selected={kind === option.value} onClick={() => setKind(option.value)}>
              {option.label}
            </Chip>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-line" aria-hidden="true" />
          {RPE_OPTIONS.map((value) => (
            <Chip key={value} label={`RPE ${value}`} selected={rpe === value} onClick={() => setRpe(rpe === value ? undefined : value)}>
              {`RPE ${value}`}
            </Chip>
          ))}
        </div>
      )}
      <Button
        size="lg"
        className="h-14 w-full text-base"
        icon={<Check className="size-5!" />}
        onClick={() => onDone(showWeight ? weight : undefined, reps, warmup ? {} : { kind, rpe })}
      >
        {warmup ? `Розминка ${warmup.number} з ${warmup.total} виконано` : `Підхід ${setNumber} виконано`}
      </Button>
    </div>
  )
}
