import { timingSafeEqual } from 'node:crypto'
import { isIP } from 'node:net'
import type { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    /** The visitor's address for rate limits; never taken from a header the visitor controls */
    clientIp: string
  }
}

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/**
 * Our nginx sits behind Render's edge and calls the API through it again, so Fastify would see the
 * nginx container's address for every visitor. nginx therefore sends the visitor's address in
 * X-Client-IP together with a secret; a request without the right secret uses the proxy address.
 */
export function registerClientIp(app: FastifyInstance, secret: string | undefined) {
  app.decorateRequest('clientIp', '')
  app.addHook('onRequest', async (request) => {
    const header = request.headers['x-client-ip']
    const given = request.headers['x-proxy-secret']
    const trusted = secret && typeof given === 'string' && same(given, secret) && typeof header === 'string' && isIP(header)
    // request.ips is [socket, ...X-Forwarded-For from right to left]: [1] is what Render's edge appended
    request.clientIp = trusted ? header : (request.ips?.[1] ?? request.ip)
  })
}
