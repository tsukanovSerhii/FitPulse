import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { bearer, buildTestApp, register, type TestApp } from './helpers.js'

let t: TestApp
let tokenA: string

const at = (minutes: number) => new Date(Date.UTC(2026, 0, 7, 10, minutes)).toISOString()
const sync = (token: string, body: { cursor: string; changes: unknown[] }) =>
  t.app.inject({ method: 'POST', url: '/api/sync', headers: bearer(token), payload: body })

beforeEach(async () => {
  t = await buildTestApp()
  tokenA = (await register(t)).json().accessToken
})
afterEach(() => t.close())

describe('POST /api/sync', () => {
  it('needs a signed-in user', async () => {
    const res = await t.app.inject({ method: 'POST', url: '/api/sync', payload: { cursor: '0', changes: [] } })
    expect(res.statusCode).toBe(401)
  })

  it('a change from one device reaches another and the cursor only returns new rows', async () => {
    const first = await sync(tokenA, { cursor: '0', changes: [{ kind: 'workout', id: 'w1', data: { id: 'w1', totalSets: 3 }, updatedAt: at(1) }] })
    expect(first.statusCode).toBe(200)
    expect(first.json()).toMatchObject({ applied: 1, changes: [], hasMore: false })

    // A second device of the same account starts from zero
    const other = await sync(tokenA, { cursor: '0', changes: [] })
    expect(other.json().changes).toEqual([{ kind: 'workout', id: 'w1', data: { id: 'w1', totalSets: 3 }, updatedAt: at(1) }])

    const again = await sync(tokenA, { cursor: other.json().cursor, changes: [] })
    expect(again.json().changes).toEqual([])
  })

  it('the newer change wins and an older one is ignored', async () => {
    await sync(tokenA, { cursor: '0', changes: [{ kind: 'setting', id: 'fitpulse_weekly_goal_v1', data: 4, updatedAt: at(5) }] })
    const older = await sync(tokenA, { cursor: '0', changes: [{ kind: 'setting', id: 'fitpulse_weekly_goal_v1', data: 2, updatedAt: at(3) }] })
    expect(older.json().applied).toBe(0)
    // The device that sent the stale value gets the current one back
    expect(older.json().changes).toEqual([{ kind: 'setting', id: 'fitpulse_weekly_goal_v1', data: 4, updatedAt: at(5) }])

    const newer = await sync(tokenA, { cursor: '0', changes: [{ kind: 'setting', id: 'fitpulse_weekly_goal_v1', data: 5, updatedAt: at(9) }] })
    expect(newer.json().applied).toBe(1)
  })

  it('a deletion reaches the other device', async () => {
    await sync(tokenA, { cursor: '0', changes: [{ kind: 'body', id: 'b1', data: { id: 'b1', weightKg: 70 }, updatedAt: at(1) }] })
    const seen = (await sync(tokenA, { cursor: '0', changes: [] })).json().cursor
    const deleting = await sync(tokenA, { cursor: seen, changes: [{ kind: 'body', id: 'b1', data: null, updatedAt: at(2) }] })
    // The device that deleted it does not get its own change back
    expect(deleting.json().changes).toEqual([])
    // A device that had seen the record gets the deletion
    const res = await sync(tokenA, { cursor: seen, changes: [] })
    expect(res.json().changes).toEqual([{ kind: 'body', id: 'b1', data: null, updatedAt: at(2) }])
    const fresh = await sync(tokenA, { cursor: '0', changes: [] })
    expect(fresh.json().changes).toEqual([{ kind: 'body', id: 'b1', data: null, updatedAt: at(2) }])
  })

  it('never shows another account its data', async () => {
    await sync(tokenA, { cursor: '0', changes: [{ kind: 'plan', id: 'p1', data: { secret: true }, updatedAt: at(1) }] })
    const tokenB = (await register(t, { email: 'other@mail.com' })).json().accessToken
    const res = await sync(tokenB, { cursor: '0', changes: [] })
    expect(res.json().changes).toEqual([])
  })

  it('a time far in the future is replaced by the server time', async () => {
    const future = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    await sync(tokenA, { cursor: '0', changes: [{ kind: 'setting', id: 'fitpulse_my_limits_v1', data: ['knees'], updatedAt: future }] })
    const row = (await sync(tokenA, { cursor: '0', changes: [] })).json().changes[0]
    expect(new Date(row.updatedAt).getTime()).toBeLessThan(Date.now() + 6 * 60 * 1000)
  })

  it('returns large histories page by page', async () => {
    const changes = Array.from({ length: 500 }, (_, i) => ({ kind: 'workout', id: `w${i}`, data: { i }, updatedAt: at(1) }))
    await sync(tokenA, { cursor: '0', changes })
    await sync(tokenA, { cursor: '0', changes: [{ kind: 'workout', id: 'w-last', data: { i: 500 }, updatedAt: at(1) }] })
    const page1 = (await sync(tokenA, { cursor: '0', changes: [] })).json()
    expect(page1.changes).toHaveLength(500)
    expect(page1.hasMore).toBe(true)
    const page2 = (await sync(tokenA, { cursor: page1.cursor, changes: [] })).json()
    expect(page2.changes).toHaveLength(1)
    expect(page2.hasMore).toBe(false)
  })

  it('rejects a record bigger than 64 KB', async () => {
    const res = await sync(tokenA, { cursor: '0', changes: [{ kind: 'plan', id: 'big', data: { text: 'x'.repeat(70 * 1024) }, updatedAt: at(1) }] })
    expect(res.statusCode).toBe(400)
    expect(res.json().error.code).toBe('VALIDATION_ERROR')
  })
})
