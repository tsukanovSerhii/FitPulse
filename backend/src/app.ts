import { buildServiceApp, type ServiceDeps } from '@fitpulse/server-core'
import type { ApiConfig } from './config.js'

export type AppDeps = ServiceDeps<ApiConfig>

/** The app API. Routes of later stages (auth, sync) are registered here. */
export async function buildApp(deps: AppDeps) {
  return buildServiceApp(deps)
}
