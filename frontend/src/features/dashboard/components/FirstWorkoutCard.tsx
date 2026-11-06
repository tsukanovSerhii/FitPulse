import { Dumbbell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card, buttonClasses } from '@/shared/ui'

/** Shown until the journal has its first workout, in place of demo history. */
export function FirstWorkoutCard({ hasPlan, onStart }: { hasPlan: boolean; onStart: () => void }) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Dumbbell className="size-5" aria-hidden />
      </span>
      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="font-sans text-lg font-bold normal-case tracking-tight">Перше тренування</h2>
          <p className="text-sm text-fg-muted">
            Тут з'являться ваші тренування, тоннаж і рекорди. Усі цифри рахуються лише з того, що ви запишете.
          </p>
        </div>
        {hasPlan ? (
          <Button size="sm" onClick={onStart}>
            Почати тренування
          </Button>
        ) : (
          <Link to="/plans" className={buttonClasses('primary', 'sm')}>
            Обрати програму
          </Link>
        )}
      </div>
    </Card>
  )
}
