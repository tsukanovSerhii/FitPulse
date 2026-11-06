import { Redis } from 'ioredis'

/** Redis client that connects on first use and fails fast, so readiness checks never hang. */
export function createRedis(url: string): Redis {
  return new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 2000 })
}

export type { Redis }
