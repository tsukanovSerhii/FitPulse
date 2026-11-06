import { buildServiceApp, type ServiceDeps } from '@fitpulse/server-core'
import type { AdminConfig } from './config.js'

export type AppDeps = ServiceDeps<AdminConfig>

/** The admin API. Staff auth and admin routes of later stages are registered here. */
export async function buildApp(deps: AppDeps) {
  return buildServiceApp(deps)
}
