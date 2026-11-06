import { Redis } from 'ioredis'

/**
 * Redis client that connects on first use and fails fast: a command gives up after 500 ms, so a
 * Redis outage slows sign-in by well under a second instead of seconds per call.
 */
export function createRedis(url: string): Redis {
  const redis = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 2000, commandTimeout: 500 })
  // Failures surface on each command; without a listener ioredis also prints every reconnect error
  redis.on('error', () => {})
  return redis
}

export type { Redis }
