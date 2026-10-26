/**
 * SEO & Meta Tags Manager
 * Динамічне оновлення мета-тегів, Open Graph та Schema.org Structured Data
 */

export interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  ogType?: 'website' | 'article'
}

export function updatePageSEO({
  title,
  description,
  keywords = [],
  ogType = 'website',
}: SEOProps): void {
  if (typeof document === 'undefined') return

  // Update document title
  const fullTitle = title.includes('FitPulse') ? title : `${title} | FitPulse`
  document.title = fullTitle

  // Update or create meta tag
  const setMetaTag = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  // Standard Meta Tags
  setMetaTag('description', description)
  if (keywords.length > 0) {
    setMetaTag(
      'keywords',
      [
        ...keywords,
        'вправи в залі',
        'техніка виконання вправ',
        'анатомія м\'язів',
        'програма тренувань',
        'фітнес трекер',
        'тренування для новачків',
      ].join(', '),
    )
  }

  // Open Graph
  setMetaTag('og:title', fullTitle, true)
  setMetaTag('og:description', description, true)
  setMetaTag('og:type', ogType, true)
  setMetaTag('og:site_name', 'FitPulse Workout Tracker', true)
  setMetaTag('og:locale', 'uk_UA', true)

  // Twitter Cards
  setMetaTag('twitter:card', 'summary_large_image')
  setMetaTag('twitter:title', fullTitle)
  setMetaTag('twitter:description', description)
}

/**
 * Генерує Schema.org JSON-LD структуровані дані для вправ
 */
export function injectExerciseSchema(exerciseName: string, description: string, muscles: string[]): void {
  if (typeof document === 'undefined') return

  const scriptId = 'exercise-schema-jsonld'
  let script = document.getElementById(scriptId) as HTMLScriptElement | null

  if (!script) {
    script = document.createElement('script')
    script.id = scriptId
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ExercisePlan',
    name: exerciseName,
    description: description,
    exerciseType: muscles.join(', '),
    audience: {
      '@type': 'PeopleAudience',
      suggestedGender: 'unisex',
    },
    educationalLevel: 'All Levels (Beginner to Advanced)',
  }

  script.text = JSON.stringify(schemaData)
}
