import type { PrismaClient } from '@fitpulse/db'
import {
  buildServiceApp,
  createAccessTokens,
  createMailer,
  createSessionService,
  REMEMBER_MS,
  SHORT_MS,
  type Mailer,
  type Redis,
} from '@fitpulse/server-core'
import { passwordResetRoutes } from './auth/password-reset.js'
import { authRoutes } from './auth/routes.js'
import { createUserSessionRepo } from './auth/users.js'
import type { ApiConfig } from './config.js'
import { meRoutes } from './me/routes.js'
import { syncRoutes } from './sync/routes.js'

export interface AppDeps {
  config: ApiConfig
  prisma: PrismaClient
  redis: Redis
  /** Defaults to the provider chosen by MAIL_PROVIDER */
  mailer?: Mailer
  /** Session clock; tests move it forward */
  now?: () => Date
}

/** The app API: health, accounts and the signed-in user's profile. */
export async function buildApp({ config, prisma, redis, mailer, now }: AppDeps) {
  const app = await buildServiceApp({ config, prisma, redis })
  const tokens = createAccessTokens(config.JWT_SECRET)
  const sessions = createSessionService({
    repo: createUserSessionRepo(prisma),
    redis,
    lifetimes: { remember: REMEMBER_MS, short: SHORT_MS },
    extendOnRefresh: true,
    now,
  })
  const mail = mailer ?? createMailer(config, { log: app.log })

  await app.register(authRoutes, { prefix: '/api/auth', config, prisma, redis, sessions, tokens, mailer: mail, now })
  await app.register(passwordResetRoutes, { prefix: '/api/auth/password', config, prisma, redis, sessions, tokens, mailer: mail, now })
  await app.register(meRoutes, { prefix: '/api/me', config, prisma, redis, tokens })
  await app.register(syncRoutes, { prefix: '/api/sync', config, prisma, redis, tokens, now })
  return app
}
