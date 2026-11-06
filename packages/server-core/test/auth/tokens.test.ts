import { describe, expect, it } from 'vitest'
import { AuthError, createAccessTokens, hashToken, newRefreshToken } from '../../src/auth/index.js'

const secret = 'a-test-secret-that-is-at-least-32-chars'

describe('access tokens', () => {
  it('signed token verifies with the same secret only', async () => {
    const token = await createAccessTokens(secret).sign({ sub: 'u1', sid: 's1', role: 'admin' })
    expect(await createAccessTokens(secret).verify(token)).toEqual({ sub: 'u1', sid: 's1', role: 'admin' })
    await expect(createAccessTokens('another-secret-that-is-at-least-32-chars').verify(token)).rejects.toBeInstanceOf(AuthError)
  })

  it('expired token is rejected', async () => {
    const tokens = createAccessTokens(secret, 1)
    const token = await tokens.sign({ sub: 'u1', sid: 's1' })
    await new Promise((resolve) => setTimeout(resolve, 2100))
    await expect(tokens.verify(token)).rejects.toMatchObject({ code: 'UNAUTHORIZED', statusCode: 401 })
  })
})

describe('refresh tokens', () => {
  it('are random and hashed with sha-256', () => {
    const a = newRefreshToken()
    expect(a).not.toBe(newRefreshToken())
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(hashToken(a)).toMatch(/^[0-9a-f]{64}$/)
    expect(hashToken(a)).toBe(hashToken(a))
  })
})
