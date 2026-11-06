import { authResponseSchema } from '@fitpulse/contracts'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { bearer, buildTestApp, login, PASSWORD, refresh, refreshCookie, register, type TestApp } from './helpers.js'

let t: TestApp

beforeEach(async () => {
  t = await buildTestApp()
})
afterEach(() => t.close())

describe('register', () => {
  it('creates the account and a session with a refresh cookie', async () => {
    const res = await register(t)
    expect(res.statusCode).toBe(201)
    const body = authResponseSchema.parse(res.json())
    expect(body.user).toMatchObject({ name: 'Ira', email: 'ira@mail.com', plan: 'free' })
    const cookie = refreshCookie(res)!
    expect(cookie.httpOnly).toBe(true)
    expect(cookie.sameSite).toBe('Lax')
    expect(cookie.path).toBe('/api/auth')
    expect(cookie.maxAge).toBe(30 * 24 * 60 * 60)
    expect(await t.prisma.session.count()).toBe(1)
    expect((await t.prisma.user.findFirstOrThrow()).passwordHash).not.toContain(PASSWORD)
  })

  it('rejects the same email in any case', async () => {
    await register(t)
    const res = await register(t, { email: 'IRA@Mail.com' })
    expect(res.statusCode).toBe(409)
    expect(res.json().error).toEqual({ code: 'EMAIL_TAKEN', message: 'Акаунт з таким email уже існує' })
  })

  it('without remember the cookie ends with the browser session', async () => {
    const res = await register(t, { remember: false })
    expect(refreshCookie(res)!.maxAge).toBeUndefined()
  })
})

describe('login', () => {
  beforeEach(async () => {
    await register(t)
  })

  it('signs in with the right password', async () => {
    const res = await login(t)
    expect(res.statusCode).toBe(200)
    expect(authResponseSchema.parse(res.json()).user.email).toBe('ira@mail.com')
    expect(refreshCookie(res)?.value).toBeTruthy()
  })

  it('wrong password and unknown email get the same answer', async () => {
    const wrong = await login(t, { password: 'wrong-password' })
    const unknown = await login(t, { email: 'nobody@mail.com' })
    expect(wrong.statusCode).toBe(401)
    expect(unknown.statusCode).toBe(401)
    expect(wrong.json()).toEqual(unknown.json())
    expect(wrong.json().error.code).toBe('INVALID_CREDENTIALS')
  })

  it('a blocked account cannot sign in', async () => {
    await t.prisma.user.updateMany({ data: { blockedAt: new Date() } })
    const res = await login(t)
    expect(res.statusCode).toBe(403)
    expect(res.json().error.code).toBe('ACCOUNT_BLOCKED')
  })

  it('sixth login in a minute is RATE_LIMITED with Retry-After', async () => {
    for (let i = 0; i < 5; i++) await login(t, { password: 'wrong-password' })
    const res = await login(t)
    expect(res.statusCode).toBe(429)
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(0)
  })
})

describe('refresh and logout', () => {
  it('refresh rotates the cookie and returns a new access token', async () => {
    const first = refreshCookie(await register(t))!.value
    const res = await refresh(t, first)
    expect(res.statusCode).toBe(200)
    const next = refreshCookie(res)!.value
    expect(next).not.toBe(first)
    expect(authResponseSchema.parse(res.json()).user.email).toBe('ira@mail.com')
  })

  it('without a cookie refresh is SESSION_EXPIRED', async () => {
    const res = await refresh(t, undefined)
    expect(res.statusCode).toBe(401)
    expect(res.json().error.code).toBe('SESSION_EXPIRED')
  })

  it('parallel refresh within grace returns REFRESH_RETRY and keeps the session', async () => {
    const first = refreshCookie(await register(t))!.value
    const next = refreshCookie(await refresh(t, first))!.value
    const late = await refresh(t, first)
    expect(late.statusCode).toBe(409)
    expect(late.json().error.code).toBe('REFRESH_RETRY')
    expect((await refresh(t, next)).statusCode).toBe(200)
  })

  it('a reused token after the grace period ends the session', async () => {
    const first = refreshCookie(await register(t))!.value
    const next = refreshCookie(await refresh(t, first))!.value
    t.advance(11_000)
    expect((await refresh(t, first)).statusCode).toBe(401)
    expect((await refresh(t, next)).statusCode).toBe(401)
  })

  it('logout ends the session and its access token at once', async () => {
    const res = await register(t)
    const { accessToken } = res.json()
    const cookie = refreshCookie(res)!.value
    const out = await t.app.inject({ method: 'POST', url: '/api/auth/logout', payload: {}, cookies: { fp_refresh: cookie } })
    expect(out.statusCode).toBe(204)
    expect(refreshCookie(out)!.value).toBe('')
    expect((await refresh(t, cookie)).statusCode).toBe(401)
    expect((await t.app.inject({ method: 'GET', url: '/api/me', headers: bearer(accessToken) })).statusCode).toBe(401)
  })

  it('cookie is Secure in production', async () => {
    await t.close()
    t = await buildTestApp({ NODE_ENV: 'production' })
    expect(refreshCookie(await register(t))!.secure).toBe(true)
  })
})
