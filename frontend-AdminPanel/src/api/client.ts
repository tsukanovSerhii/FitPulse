import { adminAuthResponseSchema, type AdminAuthResponse, type AdminUser } from '@fitpulse/contracts'

export type { AdminUser }

export class ApiError extends Error {
  readonly code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

const NO_CONNECTION = "Немає з'єднання з сервером"

/** Admin tabs share the refresh cookie, so they refresh it one at a time. */
function withRefreshLock<T>(run: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined
  return locks ? (locks.request('fitpulse-admin-refresh', run) as Promise<T>) : run()
}

/** Admin API calls on the same origin; the access token stays in memory, the refresh token in a cookie. */
export function createAdminClient(fetchFn: typeof fetch = fetch) {
  let accessToken: string | null = null
  let restoring: Promise<AdminUser | null> | null = null

  // Another tab may have just replaced the refresh cookie; its new value arrives in a moment
  async function refreshWithRetry(): Promise<AdminUser> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await session(await post('/api/auth/refresh', {}))
      } catch (error) {
        if (!(error instanceof ApiError && error.code === 'REFRESH_RETRY' && attempt < 3)) throw error
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt))
      }
    }
  }

  async function post(path: string, body: unknown): Promise<Response> {
    try {
      return await fetchFn(path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {
      throw new ApiError('NETWORK', NO_CONNECTION)
    }
  }

  async function session(res: Response): Promise<AdminUser> {
    const body = await res.json().catch(() => null)
    if (!res.ok) throw new ApiError(body?.error?.code ?? 'UNKNOWN', res.status >= 502 ? NO_CONNECTION : (body?.error?.message ?? 'Щось пішло не так'))
    const parsed: AdminAuthResponse = adminAuthResponseSchema.parse(body)
    accessToken = parsed.accessToken
    return parsed.user
  }

  return {
    login: async (email: string, password: string) => session(await post('/api/auth/login', { email, password, remember: false })),
    /** The current staff member, or null when there is no session. */
    restore: (): Promise<AdminUser | null> => {
      restoring ??= withRefreshLock(refreshWithRetry)
        .catch(() => null)
        .finally(() => {
          restoring = null
        })
      return restoring
    },
    logout: async () => {
      accessToken = null
      await post('/api/auth/logout', {}).catch(() => undefined)
    },
    get accessToken() {
      return accessToken
    },
  }
}

export type AdminClient = ReturnType<typeof createAdminClient>
