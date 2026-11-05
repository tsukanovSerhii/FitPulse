// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { recentErrors, reportError, resetErrorReporting } from './errorReporter'

describe('error reporting', () => {
  beforeEach(() => {
    localStorage.clear()
    resetErrorReporting()
  })

  it('keeps a short local log without personal data', () => {
    history.replaceState(null, '', '/workout?token=secret')
    const report = reportError(new Error('Boom'), 'render')!
    expect(report).toMatchObject({ message: 'Boom', source: 'render', path: '/workout' })
    expect(JSON.stringify(report)).not.toContain('secret')
    expect(recentErrors()[0].message).toBe('Boom')
  })

  it('reports the same error once per session', () => {
    expect(reportError(new Error('Again'), 'error')).not.toBeNull()
    expect(reportError(new Error('Again'), 'error')).toBeNull()
    expect(recentErrors()).toHaveLength(1)
  })

  it('stops after ten different errors', () => {
    for (let i = 0; i < 15; i++) reportError(new Error(`E${i}`), 'promise')
    expect(recentErrors()).toHaveLength(10)
  })
})
