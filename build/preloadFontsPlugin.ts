import type { Plugin } from 'vite'

/**
 * Adds <link rel="preload"> for the font files the first screen needs, so the browser fetches
 * them in parallel with the CSS instead of after parsing it. Names are matched against the
 * hashed build output.
 */
export function preloadFonts(names: string[]): Plugin {
  return {
    name: 'fitpulse-preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((file) => file.endsWith('.woff2') && names.some((name) => file.includes(name)))
        return files.map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
          injectTo: 'head' as const,
        }))
      },
    },
  }
}
