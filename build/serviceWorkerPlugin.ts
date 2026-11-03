import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

/**
 * Emits sw.js with the list of built scripts and styles to precache. Exercise photos and font
 * subsets are left to the runtime cache so the first install stays small.
 */
export function serviceWorker(): Plugin {
  return {
    name: 'fitpulse-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      // Fonts are split into many unicode subsets; only the ones a page uses get cached at runtime
      const built = Object.keys(bundle).filter((file) => /\.(js|css)$/.test(file))
      const precache = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png', ...built.map((file) => `/${file}`)]
      const version = Date.now().toString(36)
      const template = readFileSync(new URL('./service-worker.js', import.meta.url), 'utf8')
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: template
          .replace("const VERSION = '__VERSION__'", `const VERSION = '${version}'`)
          .replace('const PRECACHE = __PRECACHE__', `const PRECACHE = ${JSON.stringify(precache)}`),
      })
    },
  }
}
