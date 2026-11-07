import type { ModerationItem, ModerationPage as ModerationData, SubmissionStatus } from '@fitpulse/contracts'
import { useState } from 'react'
import { useApi, useSession } from '../session.tsx'
import { cx, formatDate } from '../ui/format.ts'
import { Badge, Button, Card, ErrorText } from '../ui/kit.tsx'

// The app's labels, so staff see the exercise the way users will
const MUSCLES: Record<string, string> = {
  chest: 'Груди',
  back: 'Спина',
  legs: 'Ноги',
  shoulders: 'Плечі',
  biceps: 'Біцепс',
  triceps: 'Трицепс',
  abs: 'Прес',
  cardio: 'Кардіо',
  glutes: 'Сідниці',
  calves: 'Гомілки',
}
const LEVELS: Record<string, string> = { beginner: 'Новачок', intermediate: 'Середній', advanced: 'Просунутий' }
const EQUIPMENT: Record<string, string> = {
  barbell: 'Штанга',
  ezbar: 'EZ-гриф',
  dumbbell: 'Гантелі',
  kettlebell: 'Гиря',
  smith: 'Сміт',
  machine: 'Тренажер',
  cables: 'Блок',
  crossover: 'Кросовер',
  bodyweight: 'Без обладнання',
  bands: 'Гумки',
}

const TABS: { status: SubmissionStatus; label: string }[] = [
  { status: 'pending', label: 'На перевірці' },
  { status: 'approved', label: 'Опубліковані' },
  { status: 'rejected', label: 'Відхилені' },
]

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">{title}</h3>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
        {items.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </div>
  )
}

function Submission({ item, onDone }: { item: ModerationItem; onDone: () => void }) {
  const { client } = useSession()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { exercise: ex } = item

  const decide = async (action: 'approve' | 'reject') => {
    setBusy(true)
    setError(null)
    try {
      await client.request(`/api/moderation/exercises/${item.id}/${action}`, { method: 'POST', body: action === 'reject' ? { reason: reason.trim() } : {} })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Щось пішло не так')
      setBusy(false)
    }
  }

  const meta = [MUSCLES[ex.primaryMuscle], LEVELS[ex.difficulty], EQUIPMENT[ex.equipment], `${ex.defaultSets} × ${ex.defaultReps}`, `${ex.defaultRestSeconds} с`].join(' · ')
  const others = ex.muscleGroups.filter((m) => m !== ex.primaryMuscle).map((m) => MUSCLES[m])

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold">{ex.name}</h2>
          <p className="text-sm text-fg-muted">{meta}</p>
          <p className="text-xs text-fg-subtle">
            {item.author.name} · {item.author.email} · {formatDate(item.createdAt)}
          </p>
        </div>
        {item.status === 'rejected' && item.rejectReason && <Badge tone="danger">{item.rejectReason}</Badge>}
      </div>

      {/* Plain text only: everything here was typed by a user */}
      {ex.description && <p className="text-sm">{ex.description}</p>}
      {others.length > 0 && <p className="text-sm text-fg-muted">Також: {others.join(', ')}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <List title="Кроки" items={ex.technique?.steps.map((s) => s.text) ?? []} />
        <List title="Ключові моменти" items={ex.technique?.cues ?? []} />
        <List title="Типові помилки" items={ex.technique?.mistakes ?? []} />
      </div>

      {error && <ErrorText>{error}</ErrorText>}
      {rejecting ? (
        <div className="space-y-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Причина для автора</span>
            <textarea
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
              rows={2}
              maxLength={300}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Напр. дублює вбудовану вправу"
            />
          </label>
          <div className="flex gap-2">
            <Button tone="danger" disabled={busy || reason.trim().length < 3} onClick={() => decide('reject')}>
              Надіслати відмову
            </Button>
            <Button disabled={busy} onClick={() => setRejecting(false)}>
              Скасувати
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          {item.status !== 'approved' && (
            <Button tone="primary" disabled={busy} onClick={() => decide('approve')}>
              Схвалити
            </Button>
          )}
          {item.status !== 'rejected' && (
            <Button disabled={busy} onClick={() => setRejecting(true)}>
              {item.status === 'approved' ? 'Приховати' : 'Відхилити'}
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export function ModerationPage() {
  const [status, setStatus] = useState<SubmissionStatus>('pending')
  const [page, setPage] = useState(1)
  const { data, error, reload } = useApi<ModerationData>(`/api/moderation/exercises?status=${status}&page=${page}`)
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Модерація вправ</h1>
        <div role="tablist" aria-label="Статус" className="flex gap-1 rounded-lg border border-line bg-surface p-1">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              type="button"
              role="tab"
              aria-selected={status === tab.status}
              onClick={() => {
                setStatus(tab.status)
                setPage(1)
              }}
              className={cx('rounded-md px-3 py-1 text-sm font-medium', status === tab.status ? 'bg-accent-soft text-accent' : 'text-fg-muted hover:text-fg')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      {data && data.items.length === 0 && <p className="text-fg-subtle">Заявок немає</p>}
      {data?.items.map((item) => (
        <Submission key={item.id} item={item} onDone={reload} />
      ))}
      {pages > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Назад
          </Button>
          <span className="text-fg-muted">
            {page} з {pages}
          </span>
          <Button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Далі
          </Button>
        </div>
      )}
    </div>
  )
}
