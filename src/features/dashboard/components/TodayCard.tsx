import { Play } from 'lucide-react'
import { Button, Card, ProgressBar } from '@/shared/ui'
import type { Exercise } from '@/features/exercises/model/types'
import { MUSCLE_GROUP_LABELS } from '@/features/exercises/model/types'
import { DAY_LABELS, type DayOfWeek, type PlanExercise } from '@/features/workoutPlan/model/types'
import type { WorkoutSessionState } from '@/features/workoutSession/model/types'
import { formatDuration } from '@/shared/lib/formatters'

interface TodayCardProps {
  today: DayOfWeek
  planName?: string
  exercises: PlanExercise[]
  exerciseMap: Map<string, Exercise>
  session: WorkoutSessionState
  nextDay: DayOfWeek | null
  onStart: () => void
}

const MINUTES_PER_EXERCISE = 11

export function TodayCard({ today, planName, exercises, exerciseMap, session, nextDay, onStart }: TodayCardProps) {
  const isTrainingDay = exercises.length > 0
  const totalSets = exercises.reduce((sum, e) => sum + e.sets, 0)
  const sessionDone = Object.values(session.completedSets).reduce((sum, sets) => sum + sets.length, 0)
  const sessionTotal = session.exercises.reduce((sum, e) => sum + e.sets, 0)

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
        <span className="text-accent">{session.isActive ? 'Триває зараз' : 'Сьогодні'}</span>
        <span className="truncate text-fg-subtle">{planName ?? 'Програму не обрано'}</span>
      </div>

      {session.isActive ? (
        <>
          <div>
            <p className="font-mono text-5xl font-semibold text-fg tabular">{formatDuration(session.elapsedSeconds)}</p>
            <p className="mt-2 text-sm text-fg-muted">
              {sessionDone} з {sessionTotal} підходів виконано
            </p>
          </div>
          <ProgressBar value={sessionTotal ? (sessionDone / sessionTotal) * 100 : 0} label="Прогрес тренування" />
        </>
      ) : isTrainingDay ? (
        <>
          <div>
            <h2 className="text-4xl text-fg sm:text-5xl">{DAY_LABELS[today]}</h2>
            <p className="mt-2 text-sm text-fg-muted">
              {exercises.length} вправ · {totalSets} підходів · ~{exercises.length * MINUTES_PER_EXERCISE} хв
            </p>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {exercises.map((item, i) => {
              const ex = exerciseMap.get(item.exerciseId)
              return (
                <li key={item.id} className="flex items-center gap-4 py-3 text-sm">
                  <span className="w-5 font-mono text-xs text-fg-subtle">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-fg">{ex?.name ?? 'Вправа'}</span>
                    {ex && <span className="text-xs text-fg-subtle">{MUSCLE_GROUP_LABELS[ex.primaryMuscle]}</span>}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-fg-muted tabular">
                    {item.sets}×{item.reps}
                    {item.weight ? ` · ${item.weight} кг` : ''}
                  </span>
                </li>
              )
            })}
          </ol>
        </>
      ) : (
        <div>
          <h2 className="text-4xl text-fg sm:text-5xl">Відновлення</h2>
          <p className="mt-2 text-sm text-fg-muted">
            За програмою сьогодні відпочинок.
            {nextDay && <> Наступне тренування — {DAY_LABELS[nextDay].toLowerCase()}.</>}
          </p>
        </div>
      )}

      <Button size="lg" className="w-full" onClick={onStart} icon={<Play className="fill-current" />}>
        {session.isActive ? 'Продовжити тренування' : isTrainingDay ? 'Почати тренування' : 'Вільне тренування'}
      </Button>
    </Card>
  )
}
