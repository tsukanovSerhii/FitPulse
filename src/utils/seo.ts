export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://fit-pulse-beta-opal.vercel.app').replace(/\/$/, '')
export const SITE_NAME = 'FitPulse'
export const DEFAULT_OG_IMAGE = '/og-image.jpg'

/** Pages behind login carry personal data and are excluded from indexing. */
export const PUBLIC_PATHS = ['/welcome', '/login', '/register']

export interface PageMeta {
  title: string
  description: string
  path: string
  image?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

function upsert(selector: string, create: () => HTMLElement, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
}

const meta = (key: 'name' | 'property', name: string, content: string) =>
  upsert(`meta[${key}="${name}"]`, () => document.createElement('meta'), { [key]: name, content })

const link = (rel: string, href: string, hreflang?: string) =>
  upsert(
    hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`,
    () => document.createElement('link'),
    { rel, href, ...(hreflang && { hreflang }) },
  )

export function absoluteUrl(path: string) {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`
}

export function updatePageSEO({ title, description, path, image = DEFAULT_OG_IMAGE, noindex = false, jsonLd }: PageMeta) {
  if (typeof document === 'undefined') return

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const url = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  document.title = fullTitle
  meta('name', 'description', description)
  meta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')

  link('canonical', url)
  link('alternate', url, 'uk')
  link('alternate', url, 'x-default')

  meta('property', 'og:title', fullTitle)
  meta('property', 'og:description', description)
  meta('property', 'og:url', url)
  meta('property', 'og:image', imageUrl)

  meta('name', 'twitter:title', fullTitle)
  meta('name', 'twitter:description', description)
  meta('name', 'twitter:image', imageUrl)

  const scriptId = 'page-jsonld'
  document.getElementById(scriptId)?.remove()
  if (jsonLd) {
    const script = document.createElement('script')
    script.id = scriptId
    script.type = 'application/ld+json'
    script.text = JSON.stringify(jsonLd)
    document.head.appendChild(script)
  }
}

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
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ExercisePlan',
    name: exerciseName,
    description,
    exerciseType: muscles.join(', '),
  })
}
