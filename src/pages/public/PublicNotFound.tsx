import { Link } from 'react-router-dom'
import { SEO } from '@/shared/seo/SEO'
import { buttonClasses } from '@/shared/ui'
import { CATALOG_PATH } from './content'
import { PublicLayout } from './PublicLayout'

export function PublicNotFound({ what }: { what: string }) {
  return (
    <PublicLayout>
      <SEO title="Сторінку не знайдено" description="Такої сторінки в каталозі FitPulse немає. Перегляньте всі вправи та програми тренувань у каталозі." noindex />
      <div className="mx-auto max-w-xl space-y-4 py-12 text-center">
        <h1 className="text-4xl text-fg">Не знайдено</h1>
        <p className="text-fg-muted">{what}</p>
        <Link to={CATALOG_PATH} className={buttonClasses('outline', 'md')}>
          До каталогу
        </Link>
      </div>
    </PublicLayout>
  )
}
