import { createListenerMiddleware } from '@reduxjs/toolkit'
import { registerUser } from '@/features/auth/model'
import { createProfileFor, updateProfileAsync, type UserProfile } from '@/features/profile/model'
import { addBodyEntry } from '@/features/body/model'

// Cross-feature reactions live here so features never import each other in both directions.
export const listenerMiddleware = createListenerMiddleware()

listenerMiddleware.startListening({
  actionCreator: registerUser.fulfilled,
  effect: async ({ payload: user }, api) => {
    await api.dispatch(createProfileFor(user))
  },
})

// A new body weight keeps the profile, and the BMI computed from it, current
listenerMiddleware.startListening({
  actionCreator: addBodyEntry.fulfilled,
  effect: async ({ meta }, api) => {
    const weightKg = meta.arg.weightKg
    const { profile } = (api.getState() as { profile: { profile: UserProfile } }).profile
    const newest = (api.getState() as { body: { entries: { date: string; weightKg?: number }[] } }).body.entries.find((e) => e.weightKg !== undefined)
    if (weightKg && newest?.date === meta.arg.date && profile.weightKg !== weightKg) await api.dispatch(updateProfileAsync({ ...profile, weightKg }))
  },
})
