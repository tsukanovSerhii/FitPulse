import type { FastifyInstance } from 'fastify'
import { ConfigError } from './config.js'

/** Loads config (exits with the list of bad variables), builds the app, listens and closes on SIGTERM/SIGINT. */
export async function startServer<C extends { PORT: number; HOST: string }>(
  loadConfig: () => C,
  build: (config: C) => Promise<FastifyInstance>,
) {
  let config: C
  try {
    config = loadConfig()
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(error.message)
      process.exit(1)
    }
    throw error
  }

  const app = await build(config)
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      app.close().then(() => process.exit(0))
    })
  }
  await app.listen({ port: config.PORT, host: config.HOST })
  return app
}
