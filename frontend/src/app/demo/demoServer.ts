// The FitPulse API for the frontend-only demo build: the same routes and answers as the server,
// kept in this browser. The app code is unchanged; only the transport under apiRequest differs.
import type { CommunityExercise, ExerciseSubmission, SyncRequest, SyncResponse, User } from '@fitpulse/contracts'
import { DEMO_ACCOUNT } from '@/shared/config/demo'
import { loadFromStorage, removeFromStorage, saveToStorage } from '@/shared/storage/localStorage'

interface DemoAccount extends User {
  salt: string
  passwordHash: string
}

interface DemoSession {
  userId: string
  remember: boolean
}

export const DEMO_KEYS = {
  ACCOUNTS: 'fitpulse_demo_accounts_v1',
  /** Stands in for the httpOnly refresh cookie: kept across restarts only with "remember me" */
  SESSION: 'fitpulse_demo_session_v1',
  SUBMISSIONS: 'fitpulse_demo_submissions_v1',
} as const

const json = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const noContent = () => new Response(null, { status: 204 })
const fail = (status: number, code: string, message: string) => json(status, { error: { code, message } })

const ERRORS = {
  emailTaken: () => fail(409, 'EMAIL_TAKEN', 'Акаунт з таким email уже існує'),
  invalidCredentials: () => fail(401, 'INVALID_CREDENTIALS', 'Невірний email або пароль'),
  sessionExpired: () => fail(401, 'SESSION_EXPIRED', 'Сесія завершилася. Увійдіть знову'),
  unauthorized: () => fail(401, 'UNAUTHORIZED', 'Потрібно увійти'),
  // Not 503: the client reads 502–504 as "server unreachable"
  noMail: () => fail(400, 'DEMO_UNAVAILABLE', 'У демо-версії листи не надсилаються. Створіть новий акаунт або увійдіть у демо'),
}

// --- Passwords: PBKDF2, so the demo never keeps them as plain text --------------------------

const toHex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')

async function hash(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 100_000 }, key, 256)
  return toHex(bits)
}

// --- Storage --------------------------------------------------------------------------------

const accounts = () => loadFromStorage<DemoAccount[]>(DEMO_KEYS.ACCOUNTS, [])
const saveAccounts = (list: DemoAccount[]) => saveToStorage(DEMO_KEYS.ACCOUNTS, list)
const normalize = (email: unknown) => (typeof email === 'string' ? email.trim().toLowerCase() : '')
const byEmail = (email: string) => accounts().find((a) => a.email === email)

function readSession(): DemoSession | null {
  const remembered = loadFromStorage<DemoSession | null>(DEMO_KEYS.SESSION, null)
  if (remembered) return remembered
  try {
    const raw = window.sessionStorage.getItem(DEMO_KEYS.SESSION)
    return raw ? (JSON.parse(raw) as DemoSession) : null
  } catch {
    return null
  }
}

function writeSession(session: DemoSession | null) {
  removeFromStorage(DEMO_KEYS.SESSION)
  try {
    window.sessionStorage.removeItem(DEMO_KEYS.SESSION)
    if (session && !session.remember) window.sessionStorage.setItem(DEMO_KEYS.SESSION, JSON.stringify(session))
  } catch {
    // Session storage blocked: the demo session ends with the page
  }
  if (session?.remember) saveToStorage(DEMO_KEYS.SESSION, session)
}

const currentAccount = () => {
  const session = readSession()
  return session ? accounts().find((a) => a.id === session.userId) : undefined
}

const dto = ({ id, name, email, plan, createdAt }: DemoAccount): User => ({ id, name, email, plan, createdAt })

function signIn(account: DemoAccount, remember: boolean, status = 200) {
  writeSession({ userId: account.id, remember })
  return json(status, { accessToken: `demo-${account.id}`, user: dto(account) })
}

// --- Routes ---------------------------------------------------------------------------------

type Body = Record<string, unknown>

async function register(body: Body) {
  const email = normalize(body.email)
  if (byEmail(email)) return ERRORS.emailTaken()
  const account = await createAccount(String(body.name ?? '').trim(), email, String(body.password ?? ''))
  return signIn(account, body.remember !== false, 201)
}

async function createAccount(name: string, email: string, password: string): Promise<DemoAccount> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer)
  const account: DemoAccount = { id: crypto.randomUUID(), name, email, plan: 'free', createdAt: new Date().toISOString(), salt, passwordHash: await hash(password, salt) }
  saveAccounts([...accounts(), account])
  return account
}

async function login(body: Body) {
  const email = normalize(body.email)
  // The offered demo account exists from its first sign-in
  if (email === DEMO_ACCOUNT.email && !byEmail(email)) await createAccount(DEMO_ACCOUNT.name, DEMO_ACCOUNT.email, DEMO_ACCOUNT.password)
  const account = byEmail(email)
  if (!account || (await hash(String(body.password ?? ''), account.salt)) !== account.passwordHash) return ERRORS.invalidCredentials()
  return signIn(account, body.remember === true)
}

function refresh() {
  const session = readSession()
  const account = currentAccount()
  return account && session ? signIn(account, session.remember) : ERRORS.sessionExpired()
}

async function updateMe(body: Body) {
  const account = currentAccount()
  if (!account) return ERRORS.unauthorized()
  const email = body.email === undefined ? account.email : normalize(body.email)
  if (email !== account.email) {
    if ((await hash(String(body.currentPassword ?? ''), account.salt)) !== account.passwordHash) return ERRORS.invalidCredentials()
    if (byEmail(email)) return ERRORS.emailTaken()
  }
  const updated: DemoAccount = { ...account, email, name: typeof body.name === 'string' ? body.name.trim() : account.name }
  saveAccounts(accounts().map((a) => (a.id === account.id ? updated : a)))
  return json(200, dto(updated))
}

/** Every record already lives on this device, so the demo accepts the changes and sends none back. */
function sync(body: Body) {
  if (!currentAccount()) return ERRORS.unauthorized()
  const { cursor, changes } = body as unknown as SyncRequest
  const res: SyncResponse = { applied: changes.length, cursor, hasMore: false, changes: [], rejected: [] }
  return json(200, res)
}

const submissionsKey = (userId: string) => `${DEMO_KEYS.SUBMISSIONS}:${userId}`

function submissions(method: string, body: Body) {
  const account = currentAccount()
  if (!account) return ERRORS.unauthorized()
  const list = loadFromStorage<ExerciseSubmission[]>(submissionsKey(account.id), [])
  if (method !== 'POST') return json(200, { items: list })
  // No moderators in the demo: the request waits in the "pending" state
  const submission: ExerciseSubmission = {
    id: crypto.randomUUID(),
    status: 'pending',
    rejectReason: null,
    exercise: body.exercise as CommunityExercise,
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  }
  saveToStorage(submissionsKey(account.id), [submission, ...list])
  return json(201, submission)
}

/** Answers one API request the way the FitPulse server does. */
export async function handleDemoRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const method = init.method ?? 'GET'
  const body: Body = init.body ? JSON.parse(String(init.body)) : {}

  switch (path) {
    case '/api/auth/register':
      return register(body)
    case '/api/auth/login':
      return login(body)
    case '/api/auth/refresh':
      return refresh()
    case '/api/auth/logout':
      writeSession(null)
      return noContent()
    case '/api/me':
      return updateMe(body)
    case '/api/auth/password/forgot':
    case '/api/auth/password/reset':
      return ERRORS.noMail()
    case '/api/sync':
      return sync(body)
    case '/api/activity':
      return noContent()
    case '/api/exercises/community':
      return currentAccount() ? json(200, { items: [] }) : ERRORS.unauthorized()
    case '/api/exercises/submissions':
      return submissions(method, body)
    default:
      return fail(404, 'NOT_FOUND', 'Немає такого маршруту')
  }
}
