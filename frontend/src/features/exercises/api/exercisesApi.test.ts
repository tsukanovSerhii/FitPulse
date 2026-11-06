import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'

const storage = installMemoryStorage({ signedIn: true })
const memory = storage.local
const KEY = storage.userKey('fitpulse_exercises_v1')

const { exercisesApi } = await import('./exercisesApi')
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
  beforeEach(() => storage.clear())

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
