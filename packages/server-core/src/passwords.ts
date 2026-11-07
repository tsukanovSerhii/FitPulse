import argon2 from 'argon2'
import { ErrorCode } from '@fitpulse/contracts'

// OWASP's argon2id minimum: about 19 MB and two passes per hash
const OPTIONS = { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const
// At most this many hashes at once (about 40 MB) and this many waiting; the rest get 503 instead of
// letting a flood of sign-ins exhaust the memory of a small instance
const MAX_RUNNING = 2
const MAX_WAITING = 16

/** Thrown when the hashing queue is full; the error handler answers 503. */
export class ServiceBusyError extends Error {
  readonly statusCode = 503
  readonly code = ErrorCode.ServiceUnavailable
  constructor() {
    super('Сервер перевантажений. Спробуйте за хвилину')
  }
}

let running = 0
const waiting: (() => void)[] = []

async function limited<T>(work: () => Promise<T>): Promise<T> {
  if (running >= MAX_RUNNING) {
    if (waiting.length >= MAX_WAITING) throw new ServiceBusyError()
    await new Promise<void>((resolve) => waiting.push(resolve))
  }
  running++
  try {
    return await work()
  } finally {
    running--
    waiting.shift()?.()
  }
}

export function hashPassword(password: string): Promise<string> {
  return limited(() => argon2.hash(password, OPTIONS))
}

/** False for a wrong password and for a hash argon2 cannot read. */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return limited(async () => {
    try {
      return await argon2.verify(hash, password)
    } catch {
      return false
    }
  })
}
