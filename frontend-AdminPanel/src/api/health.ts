import { healthResponseSchema } from '@fitpulse/contracts'

export type ApiStatus = 'ok' | 'down'

/** Asks the admin API whether it is alive. Any network error or unexpected body counts as down. */
export async function fetchApiHealth(fetchFn: typeof fetch = fetch): Promise<ApiStatus> {
  try {
    const res = await fetchFn('/api/health')
    if (!res.ok) return 'down'
    return healthResponseSchema.safeParse(await res.json()).success ? 'ok' : 'down'
  } catch {
    return 'down'
  }
}
