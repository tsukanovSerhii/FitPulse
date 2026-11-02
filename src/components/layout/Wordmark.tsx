import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('font-display text-2xl font-semibold uppercase leading-none tracking-tight text-fg', className)}>
      Fit<span className="text-accent">Pulse</span>
    </Link>
  )
}
