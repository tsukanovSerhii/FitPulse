import { beforeEach, describe, expect, it } from 'vitest'

const memory = new Map<string, string>()
globalThis.window = {
  localStorage: {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => memory.set(k, String(v)),
    removeItem: (k: string) => memory.delete(k),
    clear: () => memory.clear(),
    length: 0,
    key: () => null,
  },
} as unknown as Window & typeof globalThis

const { exercisesApi } = await import('@/features/exercises/api/exercisesApi')
const { INITIAL_EXERCISES } = await import('@/features/exercises/api/seed')
const { STORAGE_KEYS } = await import('@/shared/storage/localStorage')

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
  beforeEach(() => memory.clear())

  it('serves built-in exercises from code without persisting them', async () => {
    const items = await exercisesApi.getExercises()
    expect(items).toEqual(INITIAL_EXERCISES)
    expect(memory.has(STORAGE_KEYS.EXERCISES)).toBe(false)
  })

  it('persists only custom exercises and lists them first', async () => {
    const created = await exercisesApi.createExercise(custom)
    expect(JSON.parse(memory.get(STORAGE_KEYS.EXERCISES)!)).toEqual([created])
    const items = await exercisesApi.getExercises()
    expect(items[0]).toEqual(created)
    expect(items).toHaveLength(INITIAL_EXERCISES.length + 1)
  })

  it('drops stale copies of built-in exercises saved by older versions', async () => {
    const stale = { ...INITIAL_EXERCISES[0], name: 'Стара копія' }
    memory.set(STORAGE_KEYS.EXERCISES, JSON.stringify([stale, { ...custom, id: 'custom-1' }]))
    const items = await exercisesApi.getExercises()
    expect(items.find((e) => e.id === stale.id)?.name).toBe(INITIAL_EXERCISES[0].name)
    expect(JSON.parse(memory.get(STORAGE_KEYS.EXERCISES)!).map((e: { id: string }) => e.id)).toEqual(['custom-1'])
  })
})
