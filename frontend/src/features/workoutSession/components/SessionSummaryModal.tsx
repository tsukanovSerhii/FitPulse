import { useState } from 'react'
import { Modal, Button, Checkbox, Input, Select, Stat, confirmAction } from '@/shared/ui'
import type { WorkoutHistoryLog } from '@/features/progress'
import { ALL_DAYS, DAY_LABELS, type DayOfWeek } from '@/features/workoutPlan/model'
import { formatDuration, formatNumber } from '@/shared/lib/formatters'

export interface SaveAsPlan {
  name: string
  day: DayOfWeek
}

export interface SessionSummaryModalProps {
  isOpen: boolean
  workoutLog: WorkoutHistoryLog | null
  /** Offered after a free workout: defaults for saving it as a personal plan */
  planDefaults?: SaveAsPlan
  onSave: (asPlan: SaveAsPlan | null) => void
  onDiscard: () => void
  onResume: () => void
}

const DAY_OPTIONS = ALL_DAYS.map((day) => ({ value: day, label: DAY_LABELS[day] }))

export function SessionSummaryModal({ isOpen, workoutLog, planDefaults, onSave, onDiscard, onResume }: SessionSummaryModalProps) {
  const [asPlan, setAsPlan] = useState(false)
  const [name, setName] = useState(planDefaults?.name ?? '')
  const [day, setDay] = useState<DayOfWeek>(planDefaults?.day ?? 'monday')

  if (!workoutLog) return null

  const save = () => onSave(planDefaults && asPlan ? { name: name.trim() || planDefaults.name, day } : null)

  const handleDiscard = async () => {
    const ok = await confirmAction({
      title: 'Не зберігати тренування?',
      description: 'Результати цієї сесії буде втрачено.',
      confirmLabel: 'Не зберігати',
      destructive: true,
    })
    if (ok) onDiscard()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onResume}
      eyebrow="Тренування завершено"
      title="Чудова робота"
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleDiscard}>
            Не зберігати
          </Button>
          <Button onClick={save}>Зберегти</Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <Stat label="Час" value={formatDuration(workoutLog.durationSeconds)} />
          <Stat label="Тоннаж" value={formatNumber(workoutLog.totalVolumeKg)} unit="кг" accent />
          <Stat label="Підходів" value={workoutLog.totalSets} />
          <Stat label="Ккал" value={`~${workoutLog.caloriesBurned}`} />
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {workoutLog.exercises.map((ex) => (
            <li key={ex.exerciseId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="truncate text-fg">{ex.exerciseName}</span>
              <span className="shrink-0 font-mono text-xs text-fg-muted tabular">
                {ex.setsCompleted} × {Math.round(ex.totalReps / ex.setsCompleted)}
                {ex.maxWeightKg ? ` · ${ex.maxWeightKg} кг` : ''}
              </span>
            </li>
          ))}
        </ul>

        {planDefaults && (
          <div className="space-y-4 rounded-lg border border-line p-4">
            <Checkbox
              label="Зберегти як програму"
              hint="Ці вправи, підходи й вага стануть днем вашої програми, щоб повторити тренування наступного разу."
              checked={asPlan}
              onChange={(e) => setAsPlan(e.target.checked)}
            />
            {asPlan && (
              <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
                <Input label="Назва програми" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
                <Select label="День" value={day} options={DAY_OPTIONS} onChange={(e) => setDay(e.target.value as DayOfWeek)} />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
