import { useMemo, useState } from 'react'
import { Button, Modal } from '@/shared/ui'
import { MUSCLE_GROUP_LABELS, type Exercise, type MuscleGroup } from '@/features/exercises'
import { cn } from '@/shared/lib/cn'
import { pluralWord } from '@/shared/lib/formatters'
import { sortDays, trainingDaysOf } from '../lib/trainingDays'
import { ALL_DAYS, DAY_LABELS, DAY_SHORT_LABELS, type DayOfWeek } from '../model/types'

type Session = { exerciseId: string }[]

export interface TrainingDaysModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  schedule: Partial<Record<DayOfWeek, Session>>
  allExercises: Exercise[]
  confirmLabel: string
  onConfirm: (days: DayOfWeek[]) => void
}

/** Lets the user pick the weekdays they train; the plan's sessions go on them in order. */
export function TrainingDaysModal({ isOpen, onClose, planName, schedule, allExercises, confirmLabel, onConfirm }: TrainingDaysModalProps) {
  const planned = trainingDaysOf(schedule)
  const sessions = planned.map((day) => schedule[day]!)
  const needed = sessions.length
  const [picked, setPicked] = useState<DayOfWeek[]>(planned)
  const byId = useMemo(() => new Map(allExercises.map((e) => [e.id, e])), [allExercises])

  // "Груди · Трицепс": the muscles the session works most
  const focus = (session: Session) => {
    const counts = new Map<MuscleGroup, number>()
    for (const { exerciseId } of session) {
      const muscle = byId.get(exerciseId)?.primaryMuscle
      if (muscle) counts.set(muscle, (counts.get(muscle) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([muscle]) => MUSCLE_GROUP_LABELS[muscle])
      .join(' · ')
  }

  const days = sortDays(picked)
  const complete = days.length === needed

  const toggle = (day: DayOfWeek) =>
    setPicked((current) => (current.includes(day) ? current.filter((d) => d !== day) : current.length < needed ? [...current, day] : current))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={planName}
      title="Дні тренувань"
      subtitle={`У програмі ${needed} ${pluralWord(needed, ['тренування', 'тренування', 'тренувань'])} на тиждень. Позначте дні, коли ходите в зал.`}
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Скасувати
          </Button>
          <Button disabled={!complete} onClick={() => onConfirm(days)}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Дні тижня">
            {ALL_DAYS.map((day) => {
              const selected = picked.includes(day)
              const blocked = !selected && picked.length >= needed
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selected}
                  aria-label={DAY_LABELS[day]}
                  disabled={blocked}
                  onClick={() => toggle(day)}
                  className={cn(
                    'h-11 cursor-pointer rounded-md border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                    selected ? 'border-fg bg-fg text-bg' : 'border-line text-fg-muted hover:border-line-strong hover:text-fg',
                  )}
                >
                  {DAY_SHORT_LABELS[day]}
                </button>
              )
            })}
          </div>
          <p className={cn('text-xs', complete ? 'text-fg-subtle' : 'text-warning')} aria-live="polite">
            Обрано {days.length} з {needed}
            {!complete && `: оберіть ще ${needed - days.length}`}
          </p>
        </div>

        <ol className="divide-y divide-line rounded-lg border border-line">
          {sessions.map((session, i) => {
            const day = days[i]
            const muscles = focus(session)
            return (
              <li key={i} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={cn(
                    'flex h-7 w-9 shrink-0 items-center justify-center rounded text-xs font-semibold',
                    day ? 'bg-surface-2 text-fg' : 'border border-dashed border-line text-fg-subtle',
                  )}
                >
                  {day ? DAY_SHORT_LABELS[day] : '?'}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-fg">
                    Тренування {i + 1}
                    {muscles && <span className="font-normal text-fg-muted"> · {muscles}</span>}
                  </span>
                  <span className="block truncate text-xs text-fg-subtle">
                    {session.map((e) => byId.get(e.exerciseId)?.name ?? 'Вправа').join(', ')}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </Modal>
  )
}
