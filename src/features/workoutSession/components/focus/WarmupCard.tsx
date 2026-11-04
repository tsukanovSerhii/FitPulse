import { useState } from 'react'
import { Check, Flame } from 'lucide-react'
import { Button } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

const STEPS = [
  { title: 'Легке кардіо · 3–5 хв', text: 'Доріжка, велотренажер, еліпс або скакалка в спокійному темпі.' },
  { title: 'Суглоби · по 10 разів', text: 'Обертання шиї, плечей, ліктів, кистей, таза й колін.' },
  { title: 'Рухи без ваги · по 10 разів', text: 'Присідання, махи руками, нахили вперед і в сторони.' },
  { title: 'Перший підхід — легко', text: 'Першу вправу почніть з легкою вагою, щоб відчути рух.' },
]

/** A short general warm-up before the first exercise; it hides once done, skipped or a set is logged. */
export function WarmupCard({ onDone }: { onDone: () => void }) {
  const [checked, setChecked] = useState<number[]>([])
  const toggle = (i: number) => setChecked((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]))

  return (
    <section aria-labelledby="warmup-title" className="space-y-4 rounded-lg border border-line bg-surface p-4">
      <div>
        <h2 id="warmup-title" className="flex items-center gap-2 font-sans text-base font-semibold normal-case tracking-normal text-fg">
          <Flame className="size-4 text-accent" aria-hidden="true" />
          Розминка · 5–7 хв
        </h2>
        <p className="mt-1 text-sm text-fg-muted">Розігріті м’язи й суглоби — менше травм і сильніші підходи.</p>
      </div>

      <ol className="space-y-1">
        {STEPS.map((step, i) => {
          const done = checked.includes(i)
          return (
            <li key={step.title}>
              <button
                type="button"
                aria-pressed={done}
                onClick={() => toggle(i)}
                className="flex w-full cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-2"
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                    done ? 'border-success/40 bg-success-soft text-success' : 'border-line-strong text-fg-subtle',
                  )}
                >
                  {done ? <Check className="size-3" aria-hidden="true" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={cn('block text-sm font-medium', done ? 'text-fg-subtle line-through' : 'text-fg')}>{step.title}</span>
                  <span className="block text-xs text-fg-subtle">{step.text}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-wrap gap-2">
        <Button className="flex-1" icon={<Check />} onClick={onDone}>
          Розминку зроблено
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Пропустити
        </Button>
      </div>
    </section>
  )
}
