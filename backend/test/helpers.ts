import { createPrismaClient } from '@fitpulse/db'
import { createRedis, type MailMessage, type Mailer } from '@fitpulse/server-core'
import type { LightMyRequestResponse } from 'fastify'
import { buildApp } from '../src/app.js'
import { loadConfig, type ApiConfig } from '../src/config.js'

export const PASSWORD = 'secret123'

/** The API on the test database and Redis, with captured emails and an adjustable clock. */
export async function buildTestApp(overrides: Partial<Record<string, string>> = {}) {
  const config: ApiConfig = loadConfig({
    ...process.env,
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret-that-is-at-least-32-characters',
    APP_URL: 'http://localhost:5173',
    MAIL_PROVIDER: 'log',
    RATE_LIMIT_ENABLED: 'true',
    ...overrides,
  })
  const prisma = createPrismaClient(config.DATABASE_URL)
  const redis = createRedis(config.REDIS_URL)
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "sync_records", "password_reset_tokens", "sessions", "users", "admin_sessions", "admin_users" CASCADE',
  )
  // Without a local Redis the rate limits fail open; CI always has one
  await redis.flushdb().catch(() => undefined)

  const sent: MailMessage[] = []
  let failMail = false
  const mailer: Mailer = {
    async send(message) {
      if (failMail) throw new Error('mail provider down')
      sent.push(message)
    },
  }
  let clock: Date | null = null
  const app = await buildApp({ config, prisma, redis, mailer, now: () => clock ?? new Date() })

  return {
    app,
    prisma,
    sent,
    failMail: () => {
      failMail = true
    },
    /** Moves the session clock forward from now. */
    advance: (ms: number) => {
      clock = new Date((clock ?? new Date()).getTime() + ms)
    },
    close: () => app.close(),
  }
}

export type TestApp = Awaited<ReturnType<typeof buildTestApp>>

export const refreshCookie = (res: LightMyRequestResponse) => res.cookies.find((c) => c.name === 'fp_refresh')

export async function register(t: TestApp, body: Partial<{ name: string; email: string; password: string; remember: boolean }> = {}) {
  return t.app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { name: 'Ira', email: 'ira@mail.com', password: PASSWORD, remember: true, ...body },
  })
}

export async function login(t: TestApp, body: Partial<{ email: string; password: string; remember: boolean }> = {}, ip = '10.0.0.1') {
  return t.app.inject({
    method: 'POST',
    url: '/api/auth/login',
    remoteAddress: ip,
    payload: { email: 'ira@mail.com', password: PASSWORD, remember: true, ...body },
  })
}

export async function refresh(t: TestApp, token: string | undefined) {
  return t.app.inject({ method: 'POST', url: '/api/auth/refresh', payload: {}, cookies: token ? { fp_refresh: token } : {} })
}

export const bearer = (token: string) => ({ authorization: `Bearer ${token}` })
