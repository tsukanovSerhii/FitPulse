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

/** Admin API calls on the same origin; the access token stays in memory, the refresh token in a cookie. */
export function createAdminClient(fetchFn: typeof fetch = fetch) {
  let accessToken: string | null = null

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
    restore: async (): Promise<AdminUser | null> => {
      try {
        return await session(await post('/api/auth/refresh', {}))
      } catch {
        return null
      }
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
