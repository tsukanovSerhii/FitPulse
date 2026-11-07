import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { bearer, buildTestApp, register, type TestApp } from './helpers.js'

let t: TestApp
let token: string

const exercise = (over: Record<string, unknown> = {}) => ({
  name: 'Жим Арнольда',
  primaryMuscle: 'shoulders',
  muscleGroups: ['shoulders', 'triceps'],
  difficulty: 'intermediate',
  equipment: 'dumbbell',
  description: 'Розворот гантелей під час жиму',
  defaultSets: 3,
  defaultReps: 10,
  defaultRestSeconds: 90,
  technique: { steps: [{ title: 'Крок 1', text: 'Гантелі перед собою', frame: 0, seconds: 0 }], cues: ['Лікті вперед'], mistakes: [] },
  ...over,
})

const submit = (body: unknown, auth = token) =>
  t.app.inject({ method: 'POST', url: '/api/exercises/submissions', headers: bearer(auth), payload: body })
const get = (url: string, auth = token) => t.app.inject({ method: 'GET', url, headers: bearer(auth) })

beforeEach(async () => {
  t = await buildTestApp()
  token = (await register(t)).json().accessToken
})
afterEach(() => t.close())

describe('exercise submissions', () => {
  it('a submission waits for review and shows in my list, not in the catalog', async () => {
    const res = await submit({ exercise: exercise() })
    expect(res.statusCode).toBe(201)
    expect(res.json()).toMatchObject({ status: 'pending', rejectReason: null, exercise: { name: 'Жим Арнольда' } })

    const mine = (await get('/api/exercises/submissions')).json()
    expect(mine.items).toHaveLength(1)
    expect((await get('/api/exercises/community')).json().items).toEqual([])
  })

  it('needs a signed-in user', async () => {
    expect((await t.app.inject({ method: 'GET', url: '/api/exercises/community' })).statusCode).toBe(401)
    expect((await t.app.inject({ method: 'POST', url: '/api/exercises/submissions', payload: { exercise: exercise() } })).statusCode).toBe(401)
  })

  it('rejects an exercise outside the app format and drops unknown fields', async () => {
    expect((await submit({ exercise: exercise({ equipment: 'rocket' }) })).statusCode).toBe(400)
    expect((await submit({ exercise: exercise({ name: 'x'.repeat(61) }) })).statusCode).toBe(400)

    const res = await submit({ exercise: exercise({ frames: ['https://evil.example/x.png'], html: '<b>' }) })
    expect(res.statusCode).toBe(201)
    const stored = await t.prisma.communityExercise.findFirstOrThrow()
    expect(stored.data).not.toHaveProperty('frames')
    expect(stored.data).not.toHaveProperty('html')
  })

  it('allows 5 submissions a day', async () => {
    for (let i = 0; i < 5; i++) expect((await submit({ exercise: exercise({ name: `Вправа ${i}` }) })).statusCode).toBe(201)
    const res = await submit({ exercise: exercise() })
    expect(res.statusCode).toBe(429)
    expect(res.json().error.code).toBe('RATE_LIMITED')
  })

  it('the catalog lists approved public exercises of every author, with the author name', async () => {
    await submit({ exercise: exercise() })
    await t.prisma.communityExercise.updateMany({ data: { status: 'APPROVED' } })
    const other = (await register(t, { email: 'bob@mail.com', name: 'Bob' })).json().accessToken

    const items = (await get('/api/exercises/community', other)).json().items
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ name: 'Жим Арнольда', authorName: 'Ira' })
    expect(items[0].id).toMatch(/^community-[0-9a-f-]{36}$/)
  })

  it('a user sees only their own submissions', async () => {
    await submit({ exercise: exercise() })
    const other = (await register(t, { email: 'bob@mail.com', name: 'Bob' })).json().accessToken
    expect((await get('/api/exercises/submissions', other)).json().items).toEqual([])
  })

  it('a blocked account cannot submit', async () => {
    await t.prisma.user.updateMany({ data: { blockedAt: new Date() } })
    expect((await submit({ exercise: exercise() })).statusCode).toBe(403)
  })
})
