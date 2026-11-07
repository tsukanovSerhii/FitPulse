import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { bearer, buildTestApp, PASSWORD, type TestApp } from './helpers.js'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1'
let t: TestApp

beforeEach(async () => {
  t = await buildTestApp()
})
afterEach(() => t.close())

const registerFrom = (headers: Record<string, string>, ip = '93.75.12.201') =>
  t.app.inject({
    method: 'POST',
    url: '/api/auth/register',
    remoteAddress: ip,
    headers,
    payload: { name: 'Ira', email: 'ira@mail.com', password: PASSWORD, remember: true },
  })

describe('session device info', () => {
  it('a sign-in records the device, app mode, place and a truncated address only', async () => {
    await registerFrom({ 'user-agent': IPHONE, 'x-app-mode': 'installed' })
    const session = await t.prisma.session.findFirstOrThrow()
    expect(session).toMatchObject({ deviceType: 'mobile', os: 'iOS', browser: 'Safari', appMode: 'installed', ipPrefix: '93.75.12.x' })
    expect(JSON.stringify(session)).not.toContain('93.75.12.201')
    expect(session.lastSeenAt).not.toBeNull()
  })

  it('an unknown app mode is stored as browser', async () => {
    await registerFrom({ 'user-agent': IPHONE, 'x-app-mode': '<script>' })
    expect((await t.prisma.session.findFirstOrThrow()).appMode).toBe('browser')
  })

  it('old addresses are cleared after 90 days', async () => {
    await registerFrom({ 'user-agent': IPHONE })
    await t.prisma.session.updateMany({ data: { createdAt: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000) } })
    await t.cleanup()
    expect((await t.prisma.session.findFirstOrThrow()).ipPrefix).toBeNull()
  })
})

describe('POST /api/activity', () => {
  it('counts a visible minute once per 50 seconds and needs a signed-in user', async () => {
    const { accessToken } = (await registerFrom({ 'user-agent': IPHONE })).json()
    expect((await t.app.inject({ method: 'POST', url: '/api/activity', payload: {} })).statusCode).toBe(401)
    const ping = () => t.app.inject({ method: 'POST', url: '/api/activity', headers: bearer(accessToken), payload: {} })
    expect((await ping()).statusCode).toBe(204)
    await ping()
    const rows = await t.prisma.userActivity.findMany()
    expect(rows).toHaveLength(1)
    expect(rows[0]!.minutes).toBe(1)
  })
})
