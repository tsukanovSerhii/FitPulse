// PostToolUse (Edit|Write): lint the edited TypeScript file and report problems back to Claude.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
const file = input.tool_input?.file_path ?? input.tool_response?.filePath
if (!file || !/\.(ts|tsx)$/.test(file)) process.exit(0)

try {
  execFileSync('npx', ['oxlint', '--deny-warnings', file], {
    cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
    stdio: 'pipe',
    shell: process.platform === 'win32',
  })
} catch (err) {
  const output = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim()
  process.stderr.write(`oxlint found problems in ${file}:\n${output}\n`)
  process.exit(2)
}
