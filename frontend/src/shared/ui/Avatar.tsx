import { UserRound } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

/** User photo, or the same neutral placeholder for everyone without one. */
export function Avatar({ src, name, className }: { src?: string; name?: string; className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-fg-subtle', className)}>
      {src ? (
        <img src={src} alt={name ? `Фото: ${name}` : 'Фото профілю'} className="size-full object-cover" />
      ) : (
        <UserRound className="size-[55%]" aria-label={name ? `Аватар: ${name}` : 'Аватар'} />
      )}
    </span>
  )
}
