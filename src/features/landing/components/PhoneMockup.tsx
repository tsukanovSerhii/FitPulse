import { Check, Minus, Plus } from 'lucide-react'
import { progressFill, statusStyles } from '@/shared/ui'

const SETS = [
  { done: true, label: '70 кг × 8' },
  { done: true, label: '70 кг × 8' },
  { done: false, label: '72,5 кг × 6' },
]

/** Static illustration of the workout focus mode for the landing hero. */
export function PhoneMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-[290px] rounded-[2.5rem] border border-line-strong bg-surface p-3 shadow-pop sm:w-[340px]"
    >
      <div className="overflow-hidden rounded-[2rem] border border-line bg-bg">
        <div className="flex items-center justify-between px-5 pb-2 pt-4 text-[10px] text-fg-subtle">
          <span>Понеділок · Push</span>
          <span className="font-mono text-xs text-fg">32:14</span>
        </div>
        <div className="flex gap-1 px-5 pb-4">
          {[100, 66, 0, 0, 0].map((fill, i) => (
            <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
              <span className={`block h-full ${progressFill(fill === 100)}`} style={{ width: `${fill}%` }} />
            </span>
          ))}
        </div>
        <div className="space-y-4 px-5 pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Вправа 2 / 5</p>
            <p className="mt-1 font-display text-2xl uppercase leading-tight text-fg">Жим гантелей на похилій лаві</p>
          </div>
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface text-xs">
            {SETS.map((set, i) => (
              <li key={i} className={`flex items-center gap-2.5 px-3 py-2.5 ${set.done ? '' : 'bg-accent-soft'}`}>
                <span
                  className={`flex size-5 items-center justify-center rounded-full border font-mono text-[10px] ${
                    set.done ? statusStyles.done : statusStyles.current
                  }`}
                >
                  {set.done ? <Check className="size-3" /> : i + 1}
                </span>
                <span className={`font-mono ${set.done ? 'text-fg' : 'text-fg-subtle'}`}>{set.label}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1.5">
            <span className="flex size-10 items-center justify-center rounded-md bg-surface-2 text-fg">
              <Minus className="size-4" />
            </span>
            <span className="flex h-10 flex-1 items-center justify-center rounded-md border border-line font-mono text-xl text-fg">
              72,5
            </span>
            <span className="flex size-10 items-center justify-center rounded-md bg-surface-2 text-fg">
              <Plus className="size-4" />
            </span>
          </div>
          <div className="flex h-11 items-center justify-center rounded-md bg-accent text-xs font-semibold uppercase text-on-accent">
            Записати підхід 3
          </div>
        </div>
      </div>
    </div>
  )
}
