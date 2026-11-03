import { RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../lib/cn'

/** A failed lazy chunk usually means a new version was deployed; a reload fetches it. */
const isChunkLoadError = (error: Error) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    error.message,
  )

export interface ErrorScreenProps {
  error: Error
  onRetry?: () => void
  fullScreen?: boolean
}

export function ErrorScreen({ error, onRetry, fullScreen = false }: ErrorScreenProps) {
  const outdated = isChunkLoadError(error)

  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center justify-center px-6 text-center', fullScreen ? 'min-h-dvh bg-bg' : 'py-24')}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl text-fg sm:text-4xl">{outdated ? 'Вийшла нова версія' : 'Щось пішло не так'}</h1>
      <p className="mt-3 max-w-md text-fg-muted">
        {outdated
          ? 'Перезавантажте сторінку, щоб отримати оновлення. Ваші дані збережені.'
          : 'Ця частина застосунку не змогла відкритися. Ваші дані збережені, спробуйте ще раз.'}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button icon={<RotateCcw />} onClick={() => window.location.reload()}>
          Перезавантажити
        </Button>
        {onRetry && !outdated && (
          <Button variant="outline" onClick={onRetry}>
            Спробувати ще раз
          </Button>
        )}
      </div>
      {import.meta.env.DEV && <pre className="mt-8 max-w-xl overflow-auto text-left text-xs text-fg-subtle">{error.message}</pre>}
    </div>
  )
}
