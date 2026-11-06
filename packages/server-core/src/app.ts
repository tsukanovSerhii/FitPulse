import Fastify, { type FastifyServerOptions } from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { errorHandler, notFoundHandler } from './errors.js'

/** Fastify with Zod validation and the shared error and not-found handlers. */
export function createBaseApp(opts: { logger: FastifyServerOptions['logger'] }) {
  const app = Fastify({ logger: opts.logger }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.setErrorHandler(errorHandler)
  app.setNotFoundHandler(notFoundHandler)
  return app
}

export type BaseApp = ReturnType<typeof createBaseApp>
