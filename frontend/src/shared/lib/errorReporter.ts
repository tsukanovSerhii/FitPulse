import { env } from '../config/env'

/*
 * Error reports from real devices. Every report is kept in a short local log for support; when
 * VITE_ERROR_ENDPOINT is set, it is also sent there as JSON. Reports carry no personal data: the page
 * path without query, the browser, the app version, the message and a trimmed stack.
 */

export interface ErrorReport {
  message: string
  stack?: string
  source: 'error' | 'promise' | 'render'
  path: string
  userAgent: string
  version: string
  at: string
}

const LOG_KEY = 'fitpulse_error_log_v1'
const LOG_SIZE = 20
const MAX_PER_SESSION = 10

const sent = new Set<string>()

const describe = (error: unknown) =>
  error instanceof Error ? { message: error.message || error.name, stack: error.stack } : { message: String(error ?? 'Unknown error') }

/** Reports an error once per session; returns the report, or null when it was a repeat or over the limit. */
export function reportError(error: unknown, source: ErrorReport['source']): ErrorReport | null {
  const { message, stack } = describe(error)
  const key = `${source}:${message}`
  if (sent.has(key) || sent.size >= MAX_PER_SESSION) return null
  sent.add(key)

  const report: ErrorReport = {
    message: message.slice(0, 500),
    stack: stack?.split('\n').slice(0, 8).join('\n'),
    source,
    path: typeof location !== 'undefined' ? location.pathname : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    version: env.appVersion,
    at: new Date().toISOString(),
  }

  try {
    const log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as ErrorReport[]
    localStorage.setItem(LOG_KEY, JSON.stringify([report, ...log].slice(0, LOG_SIZE)))
  } catch {
    // a full or blocked storage must not break the app
  }

  if (env.errorEndpoint && typeof navigator !== 'undefined') {
    const body = JSON.stringify(report)
    if (!navigator.sendBeacon?.(env.errorEndpoint, new Blob([body], { type: 'application/json' }))) {
      fetch(env.errorEndpoint, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => undefined)
    }
  }
  return report
}

/** Recent reports on this device, newest first. */
export function recentErrors(): ErrorReport[] {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as ErrorReport[]
  } catch {
    return []
  }
}

/** Catches errors no component handled: thrown in callbacks and rejected promises. */
export function installErrorReporting() {
  window.addEventListener('error', (event) => reportError(event.error ?? event.message, 'error'))
  window.addEventListener('unhandledrejection', (event) => reportError(event.reason, 'promise'))
}

/** Clears the once-per-session memory; for tests. */
export const resetErrorReporting = () => sent.clear()
