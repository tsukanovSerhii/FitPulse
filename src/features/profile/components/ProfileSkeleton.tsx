import { LoadingRegion, Skeleton } from '@/components/ui'

export function ProfileSkeleton() {
  return (
    <LoadingRegion label="Завантаження профілю" className="space-y-8">
      <div className="rounded-lg border border-line bg-surface">
        <div className="flex items-center gap-4 p-5 sm:p-6">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-5 w-48 max-w-full" />
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-5 w-28 rounded-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-2 p-4 sm:p-5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-36 w-full rounded-lg" />
      </div>
    </LoadingRegion>
  )
}
