import { useState } from 'react'
import { Flame, Pencil, Target } from 'lucide-react'
import { Button, IconButton, Modal, NumberStepper, progressFill } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { plural } from '@/shared/lib/formatters'
import type { WeeklyGoalStats } from '@/features/progress/model'

export function WeeklyGoalCard({ stats, onChangeGoal }: { stats: WeeklyGoalStats; onChangeGoal: (goal: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(stats.goal)
  const reached = stats.done >= stats.goal
  const share = Math.min(1, stats.done / stats.goal)

  return (
    <section aria-label="Ціль тижня" className="rounded-lg border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-fg-subtle">
            <Target className="size-3.5 text-accent" aria-hidden="true" />
            Ціль тижня
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-fg tabular">
            {stats.done} / {stats.goal}
            <span className="ml-2 font-sans text-sm font-normal text-fg-muted">
              {reached ? 'ціль виконано' : `ще ${plural(stats.goal - stats.done, ['тренування', 'тренування', 'тренувань'])}`}
            </span>
          </p>
        </div>
        <IconButton
          size="sm"
          label="Змінити ціль"
          icon={<Pencil />}
          onClick={() => {
            setDraft(stats.goal)
            setEditing(true)
          }}
        />
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={stats.goal} aria-valuenow={stats.done} aria-label="Прогрес цілі тижня">
        <div className={cn('h-full transition-[width] duration-500', progressFill(reached))} style={{ width: `${share * 100}%` }} />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-sm text-fg-muted">
        <Flame className={cn('size-4', stats.streak > 0 ? 'text-accent' : 'text-fg-subtle')} aria-hidden="true" />
        {stats.streak > 0 ? `Серія: ${plural(stats.streak, ['тиждень', 'тижні', 'тижнів'])} поспіль` : 'Виконайте ціль, щоб почати серію'}
        {stats.best > stats.streak && <span className="text-fg-subtle">· рекорд {stats.best}</span>}
      </p>

      <Modal
        isOpen={editing}
        onClose={() => setEditing(false)}
        title="Ціль тижня"
        subtitle="Скільки тренувань на тиждень ви хочете робити?"
        maxWidth="sm"
        footer={
          <Button
            onClick={() => {
              onChangeGoal(draft)
              setEditing(false)
            }}
          >
            Зберегти
          </Button>
        }
      >
        <NumberStepper label="Тренувань на тиждень" value={draft} onChange={setDraft} step={1} min={1} max={7} />
      </Modal>
    </section>
  )
}
