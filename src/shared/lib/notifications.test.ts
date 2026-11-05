// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearRestNotification, requestNotifications, showRestNotification } from './notifications'

const close = vi.fn()
const showNotification = vi.fn()
const getNotifications = vi.fn(async () => [{ close }])

function install(permission: NotificationPermission, answer: NotificationPermission = permission) {
  vi.stubGlobal('Notification', Object.assign(function Notification() {}, { permission, requestPermission: vi.fn(async () => answer) }))
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { ready: Promise.resolve({ showNotification, getNotifications }) } })
}

describe('rest notifications', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  it('shows the end time of the rest and replaces the previous one', async () => {
    install('granted')
    const endsAt = new Date(2026, 10, 5, 14, 32).getTime()
    await showRestNotification(endsAt, 'Жим лежачи')
    expect(showNotification).toHaveBeenCalledWith('Відпочинок до 14:32', expect.objectContaining({ body: 'Далі: Жим лежачи', tag: 'fitpulse-rest' }))
    await clearRestNotification()
    expect(close).toHaveBeenCalled()
  })

  it('stays quiet without permission', async () => {
    install('denied')
    await showRestNotification(Date.now())
    expect(showNotification).not.toHaveBeenCalled()
    expect(await requestNotifications()).toBe(false)
  })

  it('asks once and reports the answer', async () => {
    install('default', 'granted')
    expect(await requestNotifications()).toBe(true)
  })
})
