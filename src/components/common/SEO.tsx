import React from 'react'
import { Helmet } from 'react-helmet-async'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogType?: 'website' | 'article'
  jsonLd?: Record<string, unknown>
}

const DEFAULT_TITLE = 'FitPulse — Сучасний трекер тренувань та техніка вправ'
const DEFAULT_DESC = 'FitPulse — Професійний фітнес-трекер: інтерактивна біомеханіка та анатомія м’язів, планувальник сплітів, журнал прогресу та живий таймер.'

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESC,
  keywords,
  canonicalUrl = 'https://fitpulse.app/',
  ogType = 'website',
  jsonLd,
}) => {
  const fullTitle = title ? `${title} | FitPulse` : DEFAULT_TITLE

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {/* Structured Schema */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}
