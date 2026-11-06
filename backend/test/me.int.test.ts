import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { bearer, buildTestApp, PASSWORD, register, type TestApp } from './helpers.js'

let t: TestApp
let token: string

beforeEach(async () => {
  t = await buildTestApp()
  token = (await register(t)).json().accessToken
})
afterEach(() => t.close())

const patch = (payload: Record<string, unknown>, auth = token) =>
  t.app.inject({ method: 'PATCH', url: '/api/me', headers: bearer(auth), payload })

describe('/api/me', () => {
  it('returns the account for a valid token only', async () => {
    const ok = await t.app.inject({ method: 'GET', url: '/api/me', headers: bearer(token) })
    expect(ok.statusCode).toBe(200)
    expect(ok.json()).toMatchObject({ name: 'Ira', email: 'ira@mail.com', plan: 'free' })
    const anonymous = await t.app.inject({ method: 'GET', url: '/api/me' })
    expect(anonymous.statusCode).toBe(401)
    expect(anonymous.json().error.code).toBe('UNAUTHORIZED')
  })

  it('changes the name', async () => {
    const res = await patch({ name: '  Iryna ' })
    expect(res.statusCode).toBe(200)
    expect(res.json().name).toBe('Iryna')
  })

  it('changing the email needs the current password', async () => {
    const missing = await patch({ email: 'new@mail.com' })
    expect(missing.statusCode).toBe(400)
    expect(missing.json().error.details[0].path).toBe('currentPassword')

    const wrong = await patch({ email: 'new@mail.com', currentPassword: 'wrong-password' })
    expect(wrong.statusCode).toBe(401)
    expect(wrong.json().error.code).toBe('INVALID_CREDENTIALS')

    const ok = await patch({ email: 'New@Mail.com', currentPassword: PASSWORD })
    expect(ok.statusCode).toBe(200)
    expect(ok.json().email).toBe('new@mail.com')
  })

  it('an email taken by another account is EMAIL_TAKEN', async () => {
    await register(t, { email: 'other@mail.com' })
    const res = await patch({ email: 'other@mail.com', currentPassword: PASSWORD })
    expect(res.statusCode).toBe(409)
    expect(res.json().error.code).toBe('EMAIL_TAKEN')
  })
})
