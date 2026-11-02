import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PUBLIC_PATHS, updatePageSEO, type PageMeta } from '@/utils/seo'

type SEOProps = Partial<Omit<PageMeta, 'path'>> & { title: string; description: string }

/** Updates the meta tags already in index.html instead of adding duplicates. */
export function SEO({ title, description, image, noindex, jsonLd }: SEOProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    updatePageSEO({
      title,
      description,
      path: pathname,
      image,
      noindex: noindex ?? !PUBLIC_PATHS.includes(pathname),
      jsonLd,
    })
  }, [title, description, pathname, image, noindex, jsonLd])

  return null
}
