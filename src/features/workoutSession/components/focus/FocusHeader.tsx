import { ChevronDown } from 'lucide-react'
import { Button, IconButton, progressFill } from '@/components/ui'
import { formatDuration } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export interface ExerciseProgress {
  id: string
  name: string
  done: number
  total: number
}

interface FocusHeaderProps {
  title: string
  elapsedSeconds: number
  progress: ExerciseProgress[]
  currentIndex: number
  onSelect: (index: number) => void
  onMinimize: () => void
  onFinish: () => void
}

export function FocusHeader({ title, elapsedSeconds, progress, currentIndex, onSelect, onMinimize, onFinish }: FocusHeaderProps) {
  return (
    <header className="border-b border-line pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-lg items-center gap-2 px-3">
        <IconButton label="Згорнути тренування" icon={<ChevronDown />} onClick={onMinimize} />
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-xs text-fg-subtle">{title}</p>
          <p className="font-mono text-lg font-semibold leading-tight text-fg tabular">{formatDuration(elapsedSeconds)}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onFinish} className="text-accent hover:text-accent">
          Завершити
        </Button>
      </div>
      <ol className="mx-auto flex max-w-lg gap-1 px-4 pb-3" aria-label="Вправи тренування">
        {progress.map((item, i) => (
          <li key={item.id} className="flex-1">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Вправа ${i + 1}: ${item.name}, ${item.done} з ${item.total}`}
              aria-current={i === currentIndex ? 'step' : undefined}
              className="block w-full cursor-pointer py-1.5"
            >
              <span
                className={cn(
                  'block h-1 overflow-hidden rounded-full bg-line',
                  i === currentIndex && 'ring-1 ring-accent ring-offset-1 ring-offset-bg',
                )}
              >
                <span
                  className={cn('block h-full transition-[width,background-color] duration-300', progressFill(item.done >= item.total))} style={{ width: `${(item.done / item.total) * 100}%` }} />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </header>
  )
}
