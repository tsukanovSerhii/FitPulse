import { LoadingRegion, Skeleton } from '@/shared/ui'

export function SummarySkeleton() {
  return (
    <LoadingRegion label="Завантаження підсумків" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-2.5 bg-surface p-4 sm:p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </LoadingRegion>
  )
}

/** Rows shaped like the record and history lists. */
export function ListSkeleton({ count = 3, label }: { count?: number; label: string }) {
  return (
    <LoadingRegion label={label} className="divide-y divide-line rounded-lg border border-line bg-surface">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </LoadingRegion>
  )
}
