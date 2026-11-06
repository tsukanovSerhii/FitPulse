import type { PrismaClient } from '@fitpulse/db'
import { ADMIN_MS, buildServiceApp, createAccessTokens, createSessionService, type Redis } from '@fitpulse/server-core'
import { createAdminSessionRepo } from './auth/admins.js'
import { adminAuthRoutes, adminMeRoutes } from './auth/routes.js'
import type { AdminConfig } from './config.js'

export interface AppDeps {
  config: AdminConfig
  prisma: PrismaClient
  redis: Redis
  /** Session clock; tests move it forward */
  now?: () => Date
}

/** The admin API: health and staff sign-in. Admin routes of later stages are registered here. */
export async function buildApp({ config, prisma, redis, now }: AppDeps) {
  const app = await buildServiceApp({ config, prisma, redis })
  const tokens = createAccessTokens(config.ADMIN_JWT_SECRET)
  const sessions = createSessionService({
    repo: createAdminSessionRepo(prisma),
    redis,
    lifetimes: { remember: ADMIN_MS, short: ADMIN_MS },
    extendOnRefresh: false,
    now,
  })
  await app.register(adminAuthRoutes, { prefix: '/api/auth', config, prisma, redis, sessions, tokens })
  await app.register(adminMeRoutes, { prefix: '/api/me', prisma, redis, tokens })
  return app
}
