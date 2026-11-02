// Stop: type-check and run tests when source files changed; keep Claude working if they fail.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
if (input.stop_hook_active) process.exit(0)

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const run = (cmd, args) => execFileSync(cmd, args, { cwd, stdio: 'pipe', shell: process.platform === 'win32' }).toString()

const changed = run('git', ['status', '--porcelain', '--', 'src', 'tests'])
if (!changed.trim()) process.exit(0)

for (const [label, args] of [
  ['Type check (tsc -b)', ['tsc', '-b']],
  ['Tests (vitest)', ['vitest', 'run']],
]) {
  try {
    run('npx', args)
  } catch (err) {
    const output = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim().split('\n').slice(-40).join('\n')
    process.stdout.write(JSON.stringify({ decision: 'block', reason: `${label} failed:\n${output}` }))
    process.exit(0)
  }
}
