import { describe, expect, it } from 'vitest'
import { createSessionService, hashToken } from '../../src/auth/index.js'
import { fakeRedis, fakeSessionRepo } from './fakes.js'

const HOUR = 60 * 60 * 1000
const lifetimes = { remember: 30 * 24 * HOUR, short: 12 * HOUR }

function setup({ extendOnRefresh = true } = {}) {
  let clock = new Date('2026-11-07T10:00:00Z')
  const { repo, rows } = fakeSessionRepo()
  const { redis, values } = fakeRedis()
  const sessions = createSessionService({ repo, redis, lifetimes, extendOnRefresh, now: () => clock })
  const advance = (ms: number) => {
    clock = new Date(clock.getTime() + ms)
  }
  return { sessions, rows, values, advance, now: () => clock }
}

describe('session service', () => {
  it('start stores only the token hash', async () => {
    const { sessions, rows, now } = setup()
    const started = await sessions.start('u1', { remember: true, userAgent: 'test' })
    const row = rows.get(started.sessionId)!
    expect(row.refreshTokenHash).toBe(hashToken(started.refreshToken))
    expect(JSON.stringify(row)).not.toContain(started.refreshToken)
    expect(row.expiresAt.getTime()).toBe(now().getTime() + lifetimes.remember)
  })

  it('refresh rotates the token and extends a remember session', async () => {
    const { sessions, rows, advance, now } = setup()
    const started = await sessions.start('u1', { remember: true })
    advance(HOUR)
    const next = await sessions.refresh(started.refreshToken)
    expect(next.refreshToken).not.toBe(started.refreshToken)
    expect(next).toMatchObject({ sessionId: started.sessionId, accountId: 'u1', remember: true })
    const row = rows.get(started.sessionId)!
    expect(row.previousTokenHash).toBe(hashToken(started.refreshToken))
    expect(row.expiresAt.getTime()).toBe(now().getTime() + lifetimes.remember)
  })

  it('admin refresh keeps the original expiry', async () => {
    const { sessions, rows, advance } = setup({ extendOnRefresh: false })
    const started = await sessions.start('a1', { remember: false })
    const expiry = rows.get(started.sessionId)!.expiresAt.getTime()
    advance(HOUR)
    await sessions.refresh(started.refreshToken)
    expect(rows.get(started.sessionId)!.expiresAt.getTime()).toBe(expiry)
  })

  it('a token replaced moments ago still refreshes, so a lost response does not sign out', async () => {
    const { sessions, rows, advance } = setup()
    const started = await sessions.start('u1', { remember: false })
    await sessions.refresh(started.refreshToken)
    advance(5_000)
    // The new cookie never reached the browser; it sends the previous token again
    const again = await sessions.refresh(started.refreshToken)
    expect(again.sessionId).toBe(started.sessionId)
    expect(rows.get(started.sessionId)!.revokedAt).toBeNull()
    await expect(sessions.refresh(again.refreshToken)).resolves.toMatchObject({ sessionId: started.sessionId })
  })

  it('the grace window does not move with each replay', async () => {
    const { sessions, advance } = setup()
    const started = await sessions.start('u1', { remember: false })
    await sessions.refresh(started.refreshToken)
    advance(6_000)
    await sessions.refresh(started.refreshToken)
    advance(6_000)
    await expect(sessions.refresh(started.refreshToken)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
  })

  it('two refreshes of the same token at once: one rotates, the other is told to retry', async () => {
    const { sessions } = setup()
    const started = await sessions.start('u1', { remember: true })
    const results = await Promise.allSettled([sessions.refresh(started.refreshToken), sessions.refresh(started.refreshToken)])
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult
    expect((rejected.reason as { code: string }).code).toBe('REFRESH_RETRY')
  })

  it('reused token after grace revokes the session', async () => {
    const { sessions, rows, values, advance } = setup()
    const started = await sessions.start('u1', { remember: false })
    const next = await sessions.refresh(started.refreshToken)
    advance(11_000)
    await expect(sessions.refresh(started.refreshToken)).rejects.toMatchObject({ code: 'SESSION_EXPIRED', statusCode: 401 })
    expect(rows.get(started.sessionId)!.revokedAt).not.toBeNull()
    expect(values.has(`auth:revoked:${started.sessionId}`)).toBe(true)
    await expect(sessions.refresh(next.refreshToken)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
  })

  it('expired or revoked session is SESSION_EXPIRED', async () => {
    const { sessions, advance } = setup()
    const short = await sessions.start('u1', { remember: false })
    advance(13 * HOUR)
    await expect(sessions.refresh(short.refreshToken)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })

    const other = await sessions.start('u1', { remember: true })
    await sessions.revoke(other.sessionId)
    await expect(sessions.refresh(other.refreshToken)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
    await expect(sessions.refresh('unknown-token')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
  })

  it('revokeToken ends the session of a refresh token and ignores unknown ones', async () => {
    const { sessions, rows } = setup()
    const started = await sessions.start('u1', { remember: true })
    await sessions.revokeToken(started.refreshToken)
    expect(rows.get(started.sessionId)!.revokedAt).not.toBeNull()
    await expect(sessions.revokeToken('unknown')).resolves.toBeUndefined()
  })

  it('revokeAll ends every session of the account', async () => {
    const { sessions, values } = setup()
    const a = await sessions.start('u1', { remember: true })
    const b = await sessions.start('u1', { remember: false })
    await sessions.revokeAll('u1')
    await expect(sessions.refresh(a.refreshToken)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
    await expect(sessions.refresh(b.refreshToken)).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
    expect(values.has(`auth:revoked:${b.sessionId}`)).toBe(true)
  })
})
