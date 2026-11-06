import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildTestApp, login, PASSWORD, refresh, refreshCookie, register, type TestApp } from './helpers.js'

let t: TestApp

beforeEach(async () => {
  t = await buildTestApp()
})
afterEach(() => t.close())

const forgot = (email = 'ira@mail.com', ip = '10.0.0.2') =>
  t.app.inject({ method: 'POST', url: '/api/auth/password/forgot', remoteAddress: ip, payload: { email } })
const reset = (token: string, password = 'brand-new-pass') =>
  t.app.inject({ method: 'POST', url: '/api/auth/password/reset', payload: { token, password } })
const tokenFrom = (text: string) => new URL(text.match(/https?:\/\/\S+/)![0]).searchParams.get('token')!

describe('password reset', () => {
  beforeEach(async () => {
    await register(t)
  })

  it('forgot sends a link to APP_URL/reset-password with a token', async () => {
    const res = await forgot('IRA@mail.com')
    expect(res.statusCode).toBe(204)
    expect(t.sent).toHaveLength(1)
    expect(t.sent[0]).toMatchObject({ to: 'ira@mail.com', subject: 'Відновлення пароля FitPulse' })
    expect(t.sent[0]!.text).toContain('http://localhost:5173/reset-password?token=')
    expect(t.sent[0]!.html).toContain('http://localhost:5173/reset-password?token=')
  })

  it('forgot for unknown email returns 204 without mail', async () => {
    const res = await forgot('nobody@mail.com')
    expect(res.statusCode).toBe(204)
    expect(t.sent).toHaveLength(0)
  })

  it('mailer failure still returns 204', async () => {
    t.failMail()
    expect((await forgot()).statusCode).toBe(204)
  })

  it('reset sets the new password and revokes every session', async () => {
    const session = refreshCookie(await login(t))!.value
    await forgot()
    const res = await reset(tokenFrom(t.sent[0]!.text))
    expect(res.statusCode).toBe(204)
    expect((await login(t, { password: PASSWORD })).statusCode).toBe(401)
    expect((await login(t, { password: 'brand-new-pass' })).statusCode).toBe(200)
    expect((await refresh(t, session)).statusCode).toBe(401)
  })

  it('reset token works once', async () => {
    await forgot()
    const token = tokenFrom(t.sent[0]!.text)
    expect((await reset(token)).statusCode).toBe(204)
    const again = await reset(token, 'another-new-pass')
    expect(again.statusCode).toBe(400)
    expect(again.json().error.code).toBe('RESET_TOKEN_INVALID')
  })

  it('expired reset token is RESET_TOKEN_INVALID', async () => {
    await forgot()
    t.advance(61 * 60 * 1000)
    const res = await reset(tokenFrom(t.sent[0]!.text))
    expect(res.statusCode).toBe(400)
    expect(res.json().error.code).toBe('RESET_TOKEN_INVALID')
  })

  it('a newer request invalidates the older link', async () => {
    await forgot()
    await forgot()
    expect((await reset(tokenFrom(t.sent[0]!.text))).statusCode).toBe(400)
    expect((await reset(tokenFrom(t.sent[1]!.text))).statusCode).toBe(204)
  })

  it('fourth forgot for one email in an hour is RATE_LIMITED', async () => {
    for (let i = 0; i < 3; i++) await forgot('ira@mail.com', `10.0.1.${i}`)
    const res = await forgot('ira@mail.com', '10.0.1.9')
    expect(res.statusCode).toBe(429)
  })
})
