import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryStorage } from '@/shared/testing/memoryStorage'
import { plansApi } from '../api/plansApi'
import reducer, { addExerciseToDay, fetchPlans, removeExerciseFromDay, updatePlanExercise } from './workoutPlanSlice'

const memoryStorage = installMemoryStorage({ signedIn: true })

const makeStore = () => configureStore({ reducer: { workoutPlan: reducer } })

describe('editing one plan quickly', () => {
  let store: ReturnType<typeof makeStore>
  let planId: string

  beforeEach(async () => {
    memoryStorage.clear()
    store = makeStore()
    await store.dispatch(fetchPlans())
    planId = 'plan-ppl-split'
  })

  const plan = () => store.getState().workoutPlan.plans.find((p) => p.id === planId)!
  const stored = async () => (await plansApi.getPlans()).plans.find((p) => p.id === planId)!

  // Regression: each edit used to save its own copy of the plan, so the slower one erased the other
  it('keeps both of two parallel weight changes', async () => {
    const monday = plan().schedule.monday[0].id
    const wednesday = plan().schedule.wednesday[0].id

    await Promise.all([
      store.dispatch(updatePlanExercise({ planId, day: 'monday', exerciseId: monday, updates: { weight: 123 } })),
      store.dispatch(updatePlanExercise({ planId, day: 'wednesday', exerciseId: wednesday, updates: { weight: 321 } })),
    ])

    expect(plan().schedule.monday[0].weight).toBe(123)
    expect(plan().schedule.wednesday[0].weight).toBe(321)
    const saved = await stored()
    expect(saved.schedule.monday[0].weight).toBe(123)
    expect(saved.schedule.wednesday[0].weight).toBe(321)
  })

  it('applies a burst of adds, edits and removals in order', async () => {
    const [first, second] = plan().schedule.friday
    const before = plan().schedule.friday.length

    await Promise.all([
      store.dispatch(addExerciseToDay({ planId, day: 'friday', exercise: { exerciseId: 'ex-leg-press', sets: 3, reps: 12, restSeconds: 90 } })),
      store.dispatch(updatePlanExercise({ planId, day: 'friday', exerciseId: second.id, updates: { reps: 20, notes: 'Нова нотатка' } })),
      store.dispatch(removeExerciseFromDay({ planId, day: 'friday', exerciseId: first.id })),
      store.dispatch(addExerciseToDay({ planId, day: 'tuesday', exercise: { exerciseId: 'ex-plank', sets: 3, reps: 45, restSeconds: 60 } })),
    ])

    for (const current of [plan(), await stored()]) {
      const friday = current.schedule.friday
      expect(friday).toHaveLength(before)
      expect(friday.some((e) => e.id === first.id)).toBe(false)
      expect(friday.find((e) => e.id === second.id)).toMatchObject({ reps: 20, notes: 'Нова нотатка' })
      expect(friday.at(-1)!.exerciseId).toBe('ex-leg-press')
      expect(friday.map((e) => e.order)).toEqual(friday.map((_, i) => i + 1))
      expect(current.schedule.tuesday.map((e) => e.exerciseId)).toEqual(['ex-plank'])
    }
  })

  it('rejects an edit of a missing plan without touching storage', async () => {
    const result = await store.dispatch(removeExerciseFromDay({ planId: 'nope', day: 'monday', exerciseId: 'x' }))
    expect(result.meta.requestStatus).toBe('rejected')
    expect((await plansApi.getPlans()).plans).toEqual(store.getState().workoutPlan.plans)
  })
})
