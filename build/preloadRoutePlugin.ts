import type { OutputBundle, OutputChunk } from 'rolldown'
import type { Plugin } from 'vite'

/**
 * Lazy pages normally start downloading only after the entry script runs. For the public pages a
 * visitor lands on first, a tiny inline script adds <link rel="modulepreload"> for the page chunk
 * and its imports as soon as the HTML is parsed, so they load in parallel with the entry.
 */
export function preloadRoutes(routes: Record<string, string>): Plugin {
  return {
    name: 'fitpulse-preload-routes',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_, ctx) {
        const bundle = (ctx.bundle ?? {}) as OutputBundle
        const chunks = Object.values(bundle).filter((item): item is OutputChunk => item.type === 'chunk')
        const entryFiles = new Set(chunks.filter((chunk) => chunk.isEntry).flatMap((chunk) => [chunk.fileName, ...chunk.imports]))

        const filesFor = (chunk: OutputChunk, seen = new Set<string>()): string[] => {
          if (seen.has(chunk.fileName) || entryFiles.has(chunk.fileName)) return []
          seen.add(chunk.fileName)
          const imports = chunk.imports.flatMap((file) => {
            const imported = chunks.find((c) => c.fileName === file)
            return imported ? filesFor(imported, seen) : []
          })
          return [`/${chunk.fileName}`, ...imports]
        }

        const map: Record<string, string[]> = {}
        for (const [path, page] of Object.entries(routes)) {
          const chunk = chunks.find((c) => c.facadeModuleId?.replace(/\\/g, '/').endsWith(page))
          if (chunk) map[path] = filesFor(chunk)
        }
        if (Object.keys(map).length === 0) return []

        const script = `(function(){var f=${JSON.stringify(map)}[location.pathname.replace(/\\/$/,'')];if(f)f.forEach(function(h){var l=document.createElement('link');l.rel='modulepreload';l.crossOrigin='';l.href=h;document.head.appendChild(l)})})()`
        return [{ tag: 'script', children: script, injectTo: 'head-prepend' as const }]
      },
    },
  }
}
