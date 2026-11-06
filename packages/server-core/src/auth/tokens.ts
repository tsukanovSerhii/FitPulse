import { createHash, randomBytes } from 'node:crypto'
import { jwtVerify, SignJWT } from 'jose'
import { AuthError } from './errors.js'

export interface AccessClaims {
  sub: string
  sid: string
  role?: string
}

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60

/** HS256 access tokens; verification never touches the database. */
export function createAccessTokens(secret: string, ttlSeconds = ACCESS_TOKEN_TTL_SECONDS) {
  const key = new TextEncoder().encode(secret)
  return {
    async sign({ sub, sid, role }: AccessClaims): Promise<string> {
      return new SignJWT({ sid, ...(role && { role }) })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(sub)
        .setIssuedAt()
        .setExpirationTime(`${ttlSeconds}s`)
        .sign(key)
    },
    async verify(token: string): Promise<AccessClaims> {
      try {
        const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
        if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') throw new Error('claims')
        return { sub: payload.sub, sid: payload.sid, ...(typeof payload.role === 'string' && { role: payload.role }) }
      } catch {
        throw new AuthError('UNAUTHORIZED')
      }
    },
  }
}

export type AccessTokens = ReturnType<typeof createAccessTokens>

export function newRefreshToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
