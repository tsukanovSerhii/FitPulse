import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button, NumberStepper } from '@/components/ui'
import { cn } from '@/utils/cn'

interface ActiveSetPanelProps {
  setNumber: number
  initialWeight?: number
  initialReps: number
  showWeight: boolean
  onDone: (weight: number | undefined, reps: number) => void
}

/** Current set editor. Its key changes after every set, which resets the draft values. */
export function ActiveSetPanel({ setNumber, initialWeight, initialReps, showWeight, onDone }: ActiveSetPanelProps) {
  const [weight, setWeight] = useState(initialWeight ?? 0)
  const [reps, setReps] = useState(initialReps)

  return (
    <div className="space-y-4">
      <div className={cn('grid gap-4', showWeight && 'sm:grid-cols-2')}>
        {showWeight && <NumberStepper label="Вага" unit="кг" value={weight} onChange={setWeight} step={2.5} max={500} decimals={1} />}
        <NumberStepper label="Повтори" value={reps} onChange={setReps} step={1} min={1} max={100} />
      </div>
      <Button size="lg" className="h-14 w-full text-base" icon={<Check className="!size-5" />} onClick={() => onDone(showWeight ? weight : undefined, reps)}>
        Підхід {setNumber} виконано
      </Button>
    </div>
  )
}
