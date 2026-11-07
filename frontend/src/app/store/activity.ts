const MINUTE = 60_000

/**
 * Tells the server about each minute the app is in front of a signed-in user, for the time-in-app
 * statistics. A minute that fails (offline) is simply not counted.
 */
export function startActivityPulse({ isSignedIn, send }: { isSignedIn: () => boolean; send: () => Promise<unknown> }) {
  const timer = setInterval(() => {
    if (document.visibilityState !== 'visible' || !isSignedIn()) return
    send().catch(() => undefined)
  }, MINUTE)
  return () => clearInterval(timer)
}
