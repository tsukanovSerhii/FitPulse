import Fastify, { type FastifyServerOptions } from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'
import { errorHandler, notFoundHandler } from './errors.js'

/** Fastify with Zod validation and the shared error and not-found handlers. */
export function createBaseApp(opts: { logger: FastifyServerOptions['logger'] }) {
  // Behind Render's edge: the scheme comes from X-Forwarded-Proto. The client address for limits is
  // request.clientIp (client-ip.ts), never request.ip, which takes the first, forgeable entry
  const app = Fastify({ logger: opts.logger, trustProxy: true }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.setErrorHandler(errorHandler)
  app.setNotFoundHandler(notFoundHandler)
  // API answers carry account data: never cached by browsers or proxies, never sniffed or framed
  app.addHook('onSend', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store')
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'DENY')
    reply.header('Referrer-Policy', 'no-referrer')
  })
  return app
}

export type BaseApp = ReturnType<typeof createBaseApp>
