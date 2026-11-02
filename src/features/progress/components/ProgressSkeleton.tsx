import { LoadingRegion, Skeleton } from '@/components/ui'

export function StatsGridSkeleton() {
  return (
    <LoadingRegion label="Завантаження статистики" className="mb-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-4 rounded-lg border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="size-9" />
          </div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </LoadingRegion>
  )
}

export function HistoryListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <LoadingRegion label="Завантаження журналу" className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col justify-between gap-4 rounded-lg border border-line bg-surface p-5 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="size-7" />
          </div>
        </div>
      ))}
    </LoadingRegion>
  )
}
