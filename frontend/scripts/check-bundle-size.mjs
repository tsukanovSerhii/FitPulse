// Fails the build when the app grows past its size budget. Sizes are gzip, as the browser downloads them.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const DIST = 'dist'
const KB = 1024
const BUDGET = {
  // Everything the first page needs before React starts: the entry script and the chunks it
  // preloads. About 140.5 KB today, most of it React, Redux and the router; the sync reducer and
  // listeners (~2 KB) must be there from the start so no sign-in or edit is missed
  entryJs: 142 * KB,
  css: 25 * KB,
  // Any page or data chunk loaded later
  lazyChunk: 60 * KB,
}

const gz = (file) => gzipSync(readFileSync(join(DIST, file))).length
const html = readFileSync(join(DIST, 'index.html'), 'utf8')
const entry = [...html.matchAll(/<script[^>]+type="module"[^>]+src="\/([^"]+\.js)"/g)].map((m) => m[1])
const preloaded = [...html.matchAll(/<link rel="modulepreload"[^>]+href="\/([^"]+\.js)"/g)].map((m) => m[1])
const initial = new Set([...entry, ...preloaded])
const assets = readdirSync(join(DIST, 'assets')).map((f) => `assets/${f}`)

const rows = []
const check = (label, size, limit) => rows.push({ label, size, limit, ok: size <= limit })

check('entry JS', [...initial].reduce((sum, f) => sum + gz(f), 0), BUDGET.entryJs)
check('CSS', assets.filter((f) => f.endsWith('.css')).reduce((sum, f) => sum + gz(f), 0), BUDGET.css)
const lazy = assets.filter((f) => f.endsWith('.js') && !initial.has(f)).map((f) => ({ f, size: gz(f) })).sort((a, b) => b.size - a.size)
if (lazy[0]) check(`largest chunk (${lazy[0].f})`, lazy[0].size, BUDGET.lazyChunk)

const kb = (n) => `${(n / KB).toFixed(1)} KB`
for (const r of rows) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.label}: ${kb(r.size)} of ${kb(r.limit)}`)
if (rows.some((r) => !r.ok)) {
  console.error('\nBundle size budget exceeded. Lazy-load the new code or raise the budget on purpose.')
  process.exit(1)
}
