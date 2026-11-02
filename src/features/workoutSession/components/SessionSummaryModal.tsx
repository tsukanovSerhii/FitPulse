import { Modal, Button, Stat, confirmAction } from '@/shared/ui'
import type { WorkoutHistoryLog } from '@/features/progress/model/types'
import { formatDuration, formatNumber } from '@/shared/lib/formatters'

export interface SessionSummaryModalProps {
  isOpen: boolean
  workoutLog: WorkoutHistoryLog | null
  onSave: () => void
  onDiscard: () => void
  onResume: () => void
}

export function SessionSummaryModal({ isOpen, workoutLog, onSave, onDiscard, onResume }: SessionSummaryModalProps) {
  if (!workoutLog) return null

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
          <Button onClick={onSave}>Зберегти</Button>
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
      </div>
    </Modal>
  )
}
