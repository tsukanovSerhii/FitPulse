import { LoadingRegion, Skeleton } from '@/shared/ui'

/** Fallback while a lazy page chunk downloads: a neutral header and content blocks. */
export function PageSkeleton() {
  return (
    <LoadingRegion label="Завантаження сторінки" className="space-y-6">
      <div className="space-y-2.5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3.5 w-64 max-w-full" />
      </div>
      <Skeleton className="h-11 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    </LoadingRegion>
  )
}
