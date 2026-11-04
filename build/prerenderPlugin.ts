import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'

interface PrerenderedPage {
  path: string
  title: string
  description: string
  body: string
  jsonLd?: unknown
}

/** Pages that exist without the catalog: they are listed in the sitemap but not written here. */
const STATIC_PAGES = [
  { path: '/welcome', priority: '1.0' },
  { path: '/catalog', priority: '0.9' },
  { path: '/register', priority: '0.6' },
  { path: '/login', priority: '0.3' },
  { path: '/privacy', priority: '0.2' },
  { path: '/terms', priority: '0.2' },
]

const attr = (text: string) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Copies the built index.html with the page's own title, description, canonical URL and content. */
function renderPage(template: string, page: PrerenderedPage, siteUrl: string): string {
  const url = `${siteUrl}${page.path}`
  const title = page.title.includes('FitPulse') ? page.title : `${page.title} | FitPulse`
  const setMeta = (html: string, selector: RegExp, value: string) => html.replace(selector, (_, before: string) => `${before}${attr(value)}"`)
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${attr(title)}</title>`)
  html = setMeta(html, /(<meta name="description" content=")[^"]*"/, page.description)
  html = setMeta(html, /(<meta property="og:title" content=")[^"]*"/, title)
  html = setMeta(html, /(<meta property="og:description" content=")[^"]*"/, page.description)
  html = setMeta(html, /(<meta property="og:url" content=")[^"]*"/, url)
  html = setMeta(html, /(<meta name="twitter:title" content=")[^"]*"/, title)
  html = setMeta(html, /(<meta name="twitter:description" content=")[^"]*"/, page.description)
  html = html.replace(/(<link rel="(?:canonical|alternate)"[^>]*href=")[^"]*"/g, (_, before: string) => `${before}${url}"`)
  if (page.jsonLd) html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')}</script></head>`)
  return html.replace('<div id="root"></div>', `<div id="root">${page.body}</div>`)
}

function sitemap(paths: { path: string; priority: string }[], siteUrl: string, today: string): string {
  const urls = paths
    .map(({ path, priority }) => `  <url>\n    <loc>${siteUrl}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

/**
 * Writes a static HTML copy of every public catalog page, so search engines index exercises and
 * programs without running JavaScript, and generates the sitemap from the same list. The page data
 * comes from the app's own modules, loaded once through a short-lived Vite server.
 */
export function prerenderPublicPages({ siteUrl }: { siteUrl: string }): Plugin {
  let root = ''
  let outDir = ''
  return {
    name: 'fitpulse-prerender',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const { createServer } = await import('vite')
      const server = await createServer({
        configFile: false,
        root,
        logLevel: 'error',
        appType: 'custom',
        server: { middlewareMode: true, hmr: false, ws: false },
        optimizeDeps: { noDiscovery: true, include: [] },
        resolve: { alias: { '@': resolve(root, 'src') } },
      })
      let pages: PrerenderedPage[]
      try {
        const mod = (await server.ssrLoadModule('/src/pages/public/prerender.ts')) as { publicPages: () => PrerenderedPage[] }
        pages = mod.publicPages()
      } finally {
        await server.close()
      }

      const template = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const page of pages) {
        const html = renderPage(template, page, siteUrl)
        // Hosts differ: Vercel serves /path/index.html, Vite preview looks for /path.html
        mkdirSync(join(outDir, page.path), { recursive: true })
        writeFileSync(join(outDir, page.path, 'index.html'), html)
        writeFileSync(join(outDir, `${page.path}.html`), html)
      }

      const generated = pages.filter((p) => !STATIC_PAGES.some((s) => s.path === p.path))
      const entries = [...STATIC_PAGES, ...generated.map((p) => ({ path: p.path, priority: p.path.startsWith('/program/') ? '0.7' : '0.8' }))]
      writeFileSync(join(outDir, 'sitemap.xml'), sitemap(entries, siteUrl, new Date().toISOString().slice(0, 10)))
    },
  }
}
