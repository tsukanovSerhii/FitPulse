import { LoadingRegion, Skeleton, SkeletonText } from '@/components/ui'

export function ExerciseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <LoadingRegion label="Завантаження вправ" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="size-5 rounded-full" />
          </div>
          <Skeleton className="h-5 w-4/5" />
          <SkeletonText lines={2} />
          <div className="flex gap-1.5 pt-2">
            <Skeleton className="h-6 w-16 rounded-sm" />
            <Skeleton className="h-6 w-20 rounded-sm" />
          </div>
        </div>
      ))}
    </LoadingRegion>
  )
}
