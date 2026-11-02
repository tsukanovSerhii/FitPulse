import { useEffect } from 'react'
import { updatePageSEO } from '@/utils/seo'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  ogType?: 'website' | 'article'
}

const DEFAULT_TITLE = 'FitPulse — Сучасний трекер тренувань та техніка вправ'
const DEFAULT_DESC = 'FitPulse — Професійний фітнес-трекер: інтерактивна біомеханіка та анатомія м’язів, планувальник сплітів, журнал прогресу та живий таймер.'

/** Updates the meta tags already in index.html instead of adding duplicates. */
export function SEO({ title, description = DEFAULT_DESC, keywords, ogType = 'website' }: SEOProps) {
  useEffect(() => {
    updatePageSEO({ title: title ?? DEFAULT_TITLE, description, keywords, ogType })
  }, [title, description, keywords, ogType])

  return null
}
