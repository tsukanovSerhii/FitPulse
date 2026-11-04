import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'

const memoryStorage = installMemoryStorage()
globalThis.localStorage = window.localStorage

// The module caches settings, so each test loads a fresh copy
const load = async () => {
  vi.resetModules()
  return import('./timerSettings')
}

describe('timer settings', () => {
  beforeEach(() => memoryStorage.clear())

  it('start from defaults and keep the old sound switch', async () => {
    memoryStorage.local.set('fitpulse_sound_enabled', 'false')
    const { getTimerSettings, DEFAULT_TIMER_SETTINGS } = await load()
    expect(getTimerSettings()).toEqual({ ...DEFAULT_TIMER_SETTINGS, sound: false })
  })

  it('save changes and read them back after a reload', async () => {
    const first = await load()
    first.updateTimerSettings({ restMode: 'fixed', fixedSeconds: 120, autoStart: false })
    const second = await load()
    expect(second.getTimerSettings()).toMatchObject({ restMode: 'fixed', fixedSeconds: 120, autoStart: false, step: 15 })
  })

  it('use the exercise rest unless a fixed one is set', async () => {
    const { restFor, DEFAULT_TIMER_SETTINGS } = await load()
    expect(restFor(DEFAULT_TIMER_SETTINGS, 150)).toBe(150)
    expect(restFor({ ...DEFAULT_TIMER_SETTINGS, restMode: 'fixed', fixedSeconds: 60 }, 150)).toBe(60)
  })
})
