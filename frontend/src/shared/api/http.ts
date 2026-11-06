// JSON client for the FitPulse API on the same origin (/api/*). The access token lives only in
// memory; when it expires, one refresh through the httpOnly cookie is shared by every waiting request.

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly retryAfter?: number
  readonly details?: { path: string; message: string }[]

  constructor(status: number, code: string, message: string, extra: { retryAfter?: number; details?: { path: string; message: string }[] } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.retryAfter = extra.retryAfter
    this.details = extra.details
  }
}

/** The server could not be reached: offline, DNS, or the proxy answered instead of the API. */
export class NetworkError extends Error {
  constructor() {
    super("Немає з'єднання з сервером")
    this.name = 'NetworkError'
  }
}

let accessToken: string | null = null
let refreshHandler: () => Promise<boolean> = async () => false
let refreshing: Promise<boolean> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function setRefreshHandler(handler: () => Promise<boolean>) {
  refreshHandler = handler
}

/** Tabs share the refresh cookie, so only one of them refreshes it at a time. */
export function withRefreshLock<T>(run: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined
  return locks ? (locks.request('fitpulse-refresh', run) as Promise<T>) : run()
}

/** Refreshes the access token once for all callers waiting at the same moment. */
export function refreshAccessToken(): Promise<boolean> {
  refreshing ??= refreshHandler().finally(() => {
    refreshing = null
  })
  return refreshing
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Send the access token and refresh it once on 401 */
  auth?: boolean
}

async function send(path: string, { method = 'GET', body, auth = false }: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`
  try {
    return await fetch(path, {
      method,
      headers,
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new NetworkError()
  }
}

async function errorCode(res: Response): Promise<string | undefined> {
  const body = await res.clone().json().catch(() => null)
  return body?.error?.code
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await send(path, options)
  if (res.status === 401 && options.auth && (await errorCode(res)) === 'UNAUTHORIZED' && (await refreshAccessToken())) {
    res = await send(path, options)
  }

  if (res.status === 204) return undefined as T
  // nginx answers 502–504 itself when the API is asleep or down
  if (res.status >= 502 && res.status <= 504) throw new NetworkError()

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const retryAfter = Number(res.headers.get('retry-after')) || undefined
    throw new ApiError(res.status, body?.error?.code ?? 'UNKNOWN', body?.error?.message ?? 'Щось пішло не так. Спробуйте ще раз', {
      retryAfter,
      details: body?.error?.details,
    })
  }
  return body as T
}
