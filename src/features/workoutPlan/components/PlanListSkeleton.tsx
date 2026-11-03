import { LoadingRegion, Skeleton } from '@/shared/ui'

export function PlanListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <LoadingRegion label="Завантаження програм" className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-lg border border-line bg-surface p-4 sm:p-5">
          <div className="min-w-0 flex-1 space-y-2.5">
            <Skeleton className="h-5 w-48 max-w-full" />
            <Skeleton className="h-3.5 w-3/4" />
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: 7 }, (_, d) => (
                  <Skeleton key={d} className="h-1.5 w-4 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="size-5 rounded-sm" />
        </div>
      ))}
    </LoadingRegion>
  )
}
