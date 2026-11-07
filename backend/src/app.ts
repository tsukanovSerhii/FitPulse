import type { PrismaClient } from '@fitpulse/db'
import {
  buildServiceApp,
  createAccessTokens,
  createMailer,
  createSessionService,
  openGeoLookup,
  type GeoLookup,
  REMEMBER_MS,
  SHORT_MS,
  type Mailer,
  type Redis,
} from '@fitpulse/server-core'
import { passwordResetRoutes } from './auth/password-reset.js'
import { authRoutes } from './auth/routes.js'
import { createUserSessionRepo } from './auth/users.js'
import type { ApiConfig } from './config.js'
import { activityRoutes } from './analytics/routes.js'
import { scheduleCleanup } from './analytics/cleanup.js'
import { exerciseRoutes } from './exercises/routes.js'
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
  /** Defaults to the database at GEOIP_DB */
  geo?: GeoLookup
}

/** The app API: health, accounts and the signed-in user's profile. */
export async function buildApp({ config, prisma, redis, mailer, now, geo }: AppDeps) {
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
  const lookup = geo ?? (await openGeoLookup(config.GEOIP_DB, app.log))

  await app.register(authRoutes, { prefix: '/api/auth', config, prisma, redis, sessions, tokens, mailer: mail, geo: lookup, now })
  await app.register(passwordResetRoutes, { prefix: '/api/auth/password', config, prisma, redis, sessions, tokens, mailer: mail, geo: lookup, now })
  await app.register(meRoutes, { prefix: '/api/me', config, prisma, redis, tokens })
  await app.register(syncRoutes, { prefix: '/api/sync', config, prisma, redis, tokens, now })
  await app.register(exerciseRoutes, { prefix: '/api/exercises', prisma, redis, tokens })
  await app.register(activityRoutes, { prefix: '/api/activity', prisma, redis, tokens })
  if (config.NODE_ENV !== 'test') {
    const stop = scheduleCleanup(prisma, app.log)
    app.addHook('onClose', async () => stop())
  }
  return app
}
