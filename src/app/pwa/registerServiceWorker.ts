import { toast } from 'sonner'

/** Registers the offline worker in production and offers a reload when a new version is ready. */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('/sw.js').catch(() => null)
    if (!registration) return

    const offerUpdate = (worker: ServiceWorker) =>
      toast('Доступна нова версія', {
        duration: Infinity,
        action: { label: 'Оновити', onClick: () => worker.postMessage('skip-waiting') },
      })

    if (registration.waiting && navigator.serviceWorker.controller) offerUpdate(registration.waiting)

    registration.addEventListener('updatefound', () => {
      const worker = registration.installing
      worker?.addEventListener('statechange', () => {
        // A first install has no controller yet; only real updates need a prompt
        if (worker.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(worker)
      })
    })

    let reloading = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    })
  })
}
