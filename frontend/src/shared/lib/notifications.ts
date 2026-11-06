/*
 * Local notifications through the service worker. They need no server: the page shows one while it
 * still runs, right as the phone locks. On iPhone this works for FitPulse added to the home screen,
 * iOS 16.4 and later.
 */

const REST_TAG = 'fitpulse-rest'

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator

export const notificationsAllowed = () => notificationsSupported() && Notification.permission === 'granted'

/** Asks for permission; must run from a tap. Resolves to whether notifications may be shown. */
export async function requestNotifications(): Promise<boolean> {
  if (!notificationsSupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  return (await Notification.requestPermission()) === 'granted'
}

const timeFormat = new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' })

/** "Відпочинок до 14:32" on the lock screen, replacing an earlier one. */
export async function showRestNotification(endsAt: number, next?: string): Promise<void> {
  if (!notificationsAllowed()) return
  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(`Відпочинок до ${timeFormat.format(endsAt)}`, {
    body: next ? `Далі: ${next}` : 'Потім наступний підхід',
    tag: REST_TAG,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    silent: true,
  })
}

export async function clearRestNotification(): Promise<void> {
  if (!notificationsAllowed()) return
  const registration = await navigator.serviceWorker.ready
  for (const notification of await registration.getNotifications({ tag: REST_TAG })) notification.close()
}
