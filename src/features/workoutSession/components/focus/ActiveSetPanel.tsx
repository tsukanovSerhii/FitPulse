import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button, NumberStepper } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/formatters'
import { BAR_KG, estimateOneRepMax, platesPerSide } from '../../lib/strength'

interface ActiveSetPanelProps {
  setNumber: number
  initialWeight?: number
  initialReps: number
  showWeight: boolean
  /** Barbell lifts also show which plates to load */
  barbell?: boolean
  onDone: (weight: number | undefined, reps: number) => void
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
export function ActiveSetPanel({ setNumber, initialWeight, initialReps, showWeight, barbell = false, onDone }: ActiveSetPanelProps) {
  const [weight, setWeight] = useState(initialWeight ?? 0)
  const [reps, setReps] = useState(initialReps)

  return (
    <div className="space-y-3">
      <div className={cn('grid gap-4', showWeight && 'sm:grid-cols-2')}>
        {showWeight && <NumberStepper label="Вага" unit="кг" value={weight} onChange={setWeight} step={2.5} max={500} decimals={1} />}
        <NumberStepper label="Повтори" value={reps} onChange={setReps} step={1} min={1} max={100} />
      </div>
      {showWeight && <LoadHints weight={weight} reps={reps} barbell={barbell} />}
      <Button size="lg" className="h-14 w-full text-base" icon={<Check className="size-5!" />} onClick={() => onDone(showWeight ? weight : undefined, reps)}>
        Підхід {setNumber} виконано
      </Button>
    </div>
  )
}
