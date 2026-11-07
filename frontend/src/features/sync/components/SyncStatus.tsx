import { RefreshCw } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { syncStatusText } from '../lib/statusText'
import { runSync } from '../model'

/** One quiet line about the last sync, with a button to sync now. */
export function SyncStatus() {
  const dispatch = useAppDispatch()
  const sync = useAppSelector((state) => state.sync)
  return (
    <p className="flex items-center gap-2 text-xs text-fg-subtle" role="status">
      <span className={sync.status === 'error' ? 'text-danger' : undefined}>{syncStatusText(sync)}</span>
      {sync.status === 'confirmDelete' && (
        <button type="button" className="rounded px-1 font-semibold text-danger" onClick={() => dispatch(runSync({ allowMassDelete: true }))}>
          Так, видалити
        </button>
      )}
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded px-1 text-accent hover:text-accent-hover disabled:opacity-50"
        disabled={sync.status === 'syncing'}
        onClick={() => dispatch(runSync(undefined))}
      >
        <RefreshCw className="size-3" aria-hidden />
        Синхронізувати
      </button>
    </p>
  )
}
