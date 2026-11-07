import { afterEach, describe, expect, it, vi } from 'vitest'
import { startActivityPulse } from './activity'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('activity pulse', () => {
  it('sends a minute only while signed in and the tab is visible', async () => {
    vi.useFakeTimers()
    const send = vi.fn(async () => {})
    let visible = true
    let signedIn = true
    vi.stubGlobal('document', { get visibilityState() { return visible ? 'visible' : 'hidden' } })
    const stop = startActivityPulse({ isSignedIn: () => signedIn, send })
    await vi.advanceTimersByTimeAsync(60_000)
    expect(send).toHaveBeenCalledTimes(1)
    visible = false
    await vi.advanceTimersByTimeAsync(60_000)
    signedIn = false
    visible = true
    await vi.advanceTimersByTimeAsync(60_000)
    expect(send).toHaveBeenCalledTimes(1)
    stop()
  })

  it('a failed send (offline) is not retried or counted later', async () => {
    vi.useFakeTimers()
    const send = vi.fn(async () => {
      throw new Error('offline')
    })
    vi.stubGlobal('document', { visibilityState: 'visible' })
    const stop = startActivityPulse({ isSignedIn: () => true, send })
    await vi.advanceTimersByTimeAsync(120_000)
    expect(send).toHaveBeenCalledTimes(2)
    stop()
  })
})
