import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { buttonClasses } from '@/shared/ui'
import { formatDuration } from '@/shared/lib/formatters'
import { cn } from '@/shared/lib/cn'

export function WorkoutCta({ className }: { className?: string }) {
  const session = useAppSelector((state) => state.workoutSession)

  if (session.isActive) {
    return (
      <Link
        to="/workout"
        className={buttonClasses('outline', 'sm', cn('border-accent text-accent', className))}
        aria-label={`Повернутися до тренування, минуло ${formatDuration(session.elapsedSeconds)}`}
      >
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative size-2 rounded-full bg-accent" />
        </span>
        <span className="font-mono tabular">{formatDuration(session.elapsedSeconds)}</span>
      </Link>
    )
  }

  return (
    <Link to="/workout" className={buttonClasses('primary', 'sm', className)}>
      <Play className="size-3.5 fill-current" aria-hidden="true" />
      Тренуватися
    </Link>
  )
}
