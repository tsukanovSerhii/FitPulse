import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { SEO } from '@/shared/seo/SEO'
import { buttonClasses } from '@/shared/ui'
import { PAGE_META } from '../meta'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <SEO {...PAGE_META.notFound} />
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 text-4xl text-fg sm:text-5xl">Сторінку не знайдено</h1>
      <p className="mt-3 max-w-md text-fg-muted">Можливо, посилання застаріло або сторінку перенесли.</p>
      <Link to="/" className={buttonClasses('primary', 'md', 'mt-8')}>
        <Home className="size-4" aria-hidden="true" />
        На головну
      </Link>
    </div>
  )
}
