import { useEffect, useMemo, useState } from 'react'
import { Check, Clock, Plus } from 'lucide-react'
import { Badge, Button, Disclosure, Modal, SegmentedControl, Skeleton } from '@/shared/ui'
import type { Exercise } from '@/features/exercises'
import { cn } from '@/shared/lib/cn'
import { plural } from '@/shared/lib/formatters'
import { filterTemplates, templateDays, type DaysFilter } from '../lib/templates'
import { ALL_DAYS, DAY_SHORT_LABELS, PLAN_GOAL_LABELS, PLAN_LEVEL_LABELS, type PlanGoal, type PlanTemplate } from '../model/types'

export interface PlanTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  allExercises: Exercise[]
  /** Template ids the user already has a plan from */
  addedTemplateIds: Set<string>
  onAdd: (template: PlanTemplate) => void
}

const LEVEL_VARIANT = { beginner: 'success', intermediate: 'warning', advanced: 'danger' } as const

const DAY_OPTIONS: { value: DaysFilter; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: '2-3', label: '2–3 дні' },
  { value: '4-5', label: '4–5 днів' },
  { value: '6+', label: '6 днів' },
]

const GOAL_OPTIONS: { value: PlanGoal | 'all'; label: string }[] = [
  { value: 'all', label: 'Усі цілі' },
  { value: 'muscle', label: 'Маса' },
  { value: 'strength', label: 'Сила' },
  { value: 'fatLoss', label: 'Схуднення' },
  { value: 'general', label: 'Загальна' },
]

export function PlanTemplatesModal({ isOpen, onClose, allExercises, addedTemplateIds, onAdd }: PlanTemplatesModalProps) {
  const [templates, setTemplates] = useState<PlanTemplate[] | null>(null)
  const [days, setDays] = useState<DaysFilter>('all')
  const [goal, setGoal] = useState<PlanGoal | 'all'>('all')

  // The library is only needed once the dialog opens
  useEffect(() => {
    if (!isOpen || templates) return
    import('../api/templates').then((module) => setTemplates(module.PLAN_TEMPLATES))
  }, [isOpen, templates])

  const names = useMemo(() => new Map(allExercises.map((e) => [e.id, e.name])), [allExercises])
  const visible = templates ? filterTemplates(templates, { days, goal }) : []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      eyebrow="Бібліотека"
      title="Готові програми"
      subtitle="Додайте програму до своїх і змінюйте її як завгодно: шаблон залишиться незмінним."
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <SegmentedControl label="Днів на тиждень" size="sm" options={DAY_OPTIONS} value={days} onChange={setDays} className="self-start" />
          <div className="-mx-1 overflow-x-auto px-1">
            <SegmentedControl label="Ціль" size="sm" options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
          </div>
        </div>

        {!templates ? (
          <div className="space-y-3" aria-busy="true" aria-label="Завантаження програм">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-fg-muted">
            Немає програм з такими умовами. Спробуйте інший фільтр.
          </p>
        ) : (
          <ul className="space-y-3">
            {visible.map((template) => (
              <li key={template.id}>
                <TemplateCard template={template} names={names} added={addedTemplateIds.has(template.id)} onAdd={() => onAdd(template)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}

function TemplateCard({ template, names, added, onAdd }: { template: PlanTemplate; names: Map<string, string>; added: boolean; onAdd: () => void }) {
  const trainingDays = templateDays(template)

  return (
    <article className="rounded-lg border border-line bg-surface px-4 pt-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <h3 className="font-sans text-base font-semibold normal-case tracking-normal text-fg">{template.name}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge size="sm" variant={LEVEL_VARIANT[template.level]}>
              {PLAN_LEVEL_LABELS[template.level]}
            </Badge>
            <Badge size="sm">{PLAN_GOAL_LABELS[template.goal]}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
              <Clock className="size-3.5" aria-hidden="true" />~{template.minutes} хв
            </span>
          </div>
        </div>
        <Button size="sm" variant={added ? 'ghost' : 'primary'} icon={added ? <Check /> : <Plus />} onClick={onAdd} className="shrink-0">
          {added ? 'Ще раз' : 'Додати'}
        </Button>
      </div>

      <p className="mt-3 text-sm text-fg-muted">{template.description}</p>

      <div className="mt-3 flex items-center gap-3">
        <span className="flex gap-1" aria-hidden="true">
          {ALL_DAYS.map((day) => (
            <span
              key={day}
              className={cn(
                'flex h-6 w-7 items-center justify-center rounded text-[10px] font-semibold',
                trainingDays.includes(day) ? 'bg-surface-2 text-fg' : 'text-fg-subtle',
              )}
            >
              {DAY_SHORT_LABELS[day]}
            </span>
          ))}
        </span>
        <span className="text-xs text-fg-subtle">{plural(trainingDays.length, ['день', 'дні', 'днів'])} на тиждень</span>
      </div>

      <Disclosure title="Вправи по днях" className="mt-3">
        <dl className="space-y-3">
          {trainingDays.map((day) => (
            <div key={day} className="grid grid-cols-[2rem_1fr] gap-x-3">
              <dt className="pt-0.5 text-xs font-semibold text-fg-muted">{DAY_SHORT_LABELS[day]}</dt>
              <dd>
                <ul className="space-y-1 text-sm text-fg">
                  {template.schedule[day]!.map((exercise, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0">{names.get(exercise.exerciseId) ?? 'Вправа'}</span>
                      <span className="shrink-0 font-mono text-xs text-fg-muted tabular-nums">
                        {exercise.sets}×{exercise.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Disclosure>
    </article>
  )
}
