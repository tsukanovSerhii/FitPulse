import { ErrorCode, type ErrorResponse } from '@fitpulse/contracts'
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'

const toPath = (instancePath: string) => instancePath.replace(/^\//, '').replaceAll('/', '.')

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (hasZodFastifySchemaValidationErrors(error)) {
    const body: ErrorResponse = {
      error: {
        code: ErrorCode.Validation,
        message: 'Request validation failed',
        details: error.validation.map((issue) => ({ path: toPath(issue.instancePath), message: issue.message ?? 'Invalid value' })),
      },
    }
    return reply.status(400).send(body)
  }

  const status = error.statusCode ?? 500
  if (status < 500 || status === 503) {
    const retryAfter = (error as { retryAfter?: number }).retryAfter
    if (retryAfter) reply.header('Retry-After', String(retryAfter))
    const body: ErrorResponse = { error: { code: error.code ?? 'BAD_REQUEST', message: error.message } }
    return reply.status(status).send(body)
  }

  request.log.error({ err: error }, 'Unhandled error')
  const body: ErrorResponse = { error: { code: ErrorCode.Internal, message: 'Internal server error' } }
  return reply.status(500).send(body)
}

export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
  const body: ErrorResponse = {
    error: { code: ErrorCode.NotFound, message: `Route ${request.method} ${request.url} not found` },
  }
  return reply.status(404).send(body)
}
