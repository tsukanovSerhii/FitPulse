import { createListenerMiddleware } from '@reduxjs/toolkit'
import { registerUser } from '@/features/auth/model'
import { createProfileFor } from '@/features/profile/model'

// Cross-feature reactions live here so features never import each other in both directions.
export const listenerMiddleware = createListenerMiddleware()

listenerMiddleware.startListening({
  actionCreator: registerUser.fulfilled,
  effect: async ({ payload: user }, api) => {
    await api.dispatch(createProfileFor(user))
  },
})
