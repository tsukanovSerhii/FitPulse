import { LoadingRegion, Skeleton } from '@/shared/ui'

export function DashboardSkeleton() {
  return (
    <LoadingRegion label="Завантаження головної" className="space-y-6 lg:space-y-8">
      <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="mt-4 h-12 w-56 max-w-full" />
        <Skeleton className="mt-3 h-3.5 w-44" />
        <div className="mt-5 divide-y divide-line border-y border-line">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5">
              <Skeleton className="h-3 w-5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-5 h-12 w-full" />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-14 sm:h-16" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-surface">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-2.5 p-4 sm:p-5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  )
}
