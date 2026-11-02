// PreToolUse (Bash): block risky pushes and commit messages that break project rules.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
const command = input.tool_input?.command ?? ''

const deny = (reason) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
    }),
  )
  process.exit(0)
}

const currentBranch = () => {
  try {
    return execFileSync('git', ['branch', '--show-current'], { cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd() })
      .toString()
      .trim()
  } catch {
    return ''
  }
}

if (/\bgit\s+push\b/.test(command)) {
  const push = command.slice(command.search(/\bgit\s+push\b/))
  if (/(\s|^)(--force(-with-lease)?|-f)(\s|=|$)/.test(push)) deny('Force push is not allowed in this project.')
  if (/(\s|:)main(\s|$|;|&)/.test(push)) deny('Pushing to main triggers the Vercel deploy. Ask the user to merge instead.')
  if (/\bgit\s+push\s*($|;|&|\|)/.test(push) && currentBranch() === 'main') deny('Current branch is main; pushing it is not allowed.')
}

if (/\bgit\s+commit\b/.test(command)) {
  if (/co-authored-by/i.test(command)) deny('Commit messages must not contain Co-Authored-By trailers.')
  if (/generated with \[?claude|noreply@anthropic\.com/i.test(command)) deny('Commit messages must not include Claude attribution.')
  if (/\p{Extended_Pictographic}/u.test(command)) deny('Commit messages must not contain emoji.')
}
