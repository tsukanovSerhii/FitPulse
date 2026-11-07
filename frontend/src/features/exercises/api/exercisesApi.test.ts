import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'

const storage = installMemoryStorage({ signedIn: true })
const memory = storage.local
const KEY = storage.userKey('fitpulse_exercises_v1')

const community = vi.hoisted(() => ({ list: vi.fn(async () => [] as unknown[]) }))
vi.mock('./communityApi', async (real) => ({ ...(await real<typeof import('./communityApi')>()), communityApi: community }))

const { exercisesApi } = await import('./exercisesApi')
const { toSubmission } = await import('./communityApi')
const { INITIAL_EXERCISES } = await import('./seed')

const custom = {
  name: 'Моя вправа',
  muscleGroups: ['chest' as const],
  primaryMuscle: 'chest' as const,
  difficulty: 'beginner' as const,
  equipment: 'dumbbell' as const,
  description: '',
  instructions: [{ step: 1, description: 'Крок' }],
  tips: [],
  defaultSets: 3,
  defaultReps: 10,
  defaultRestSeconds: 60,
}

describe('exercisesApi storage', () => {
  beforeEach(() => {
    storage.clear()
    community.list.mockResolvedValue([])
  })

  it('serves built-in exercises from code without persisting them', async () => {
    const items = await exercisesApi.getExercises()
    expect(items).toEqual(INITIAL_EXERCISES)
    expect(memory.has(KEY)).toBe(false)
  })

  it('persists only custom exercises and lists them first', async () => {
    const created = await exercisesApi.createExercise(custom)
    expect(JSON.parse(memory.get(KEY)!)).toEqual([created])
    const items = await exercisesApi.getExercises()
    expect(items[0]).toEqual(created)
    expect(items).toHaveLength(INITIAL_EXERCISES.length + 1)
  })

  it('drops stale copies of built-in exercises saved by older versions', async () => {
    const stale = { ...INITIAL_EXERCISES[0], name: 'Стара копія' }
    memory.set(KEY, JSON.stringify([stale, { ...custom, id: 'custom-1' }]))
    const items = await exercisesApi.getExercises()
    expect(items.find((e) => e.id === stale.id)?.name).toBe(INITIAL_EXERCISES[0].name)
    expect(JSON.parse(memory.get(KEY)!).map((e: { id: string }) => e.id)).toEqual(['custom-1'])
  })
})

describe('community exercises in the catalog', () => {
  const approved = { ...custom, id: 'community-6f1c2b4e-1a2b-4c3d-9e8f-0a1b2c3d4e5f', authorName: 'Bob' }

  beforeEach(() => {
    storage.clear()
    community.list.mockReset()
  })

  it('lists approved exercises after the user\'s own and before the built-in ones', async () => {
    community.list.mockResolvedValue([approved])
    const created = await exercisesApi.createExercise(custom)
    const items = await exercisesApi.getExercises()
    expect(items.slice(0, 2)).toEqual([created, approved])
    expect(items).toHaveLength(INITIAL_EXERCISES.length + 2)
  })

  it('offline, the last list the server sent is used', async () => {
    community.list.mockResolvedValueOnce([approved])
    await exercisesApi.getExercises()
    community.list.mockRejectedValueOnce(new Error('offline'))
    expect((await exercisesApi.getExercises())[0]).toEqual(approved)
  })

  it('a shared exercise is sent without its id or fields the server does not take', () => {
    const sent = toSubmission({ ...custom, id: 'custom-1', instructions: [{ step: 1, description: 'x' }], frames: ['a', 'b'] } as never)
    expect(sent).not.toHaveProperty('id')
    expect(sent).not.toHaveProperty('instructions')
    expect(sent).not.toHaveProperty('frames')
    expect(sent).toMatchObject({ name: 'Моя вправа', muscleGroups: ['chest'], defaultRestSeconds: 60 })
  })
})

describe('a slow server', () => {
  it('does not hold the catalog: after 3 s the cached list is used', async () => {
    storage.clear()
    vi.useFakeTimers()
    community.list.mockReturnValue(new Promise(() => undefined))
    const pending = exercisesApi.getExercises()
    await vi.advanceTimersByTimeAsync(3000)
    expect(await pending).toHaveLength(INITIAL_EXERCISES.length)
    vi.useRealTimers()
  })
})
