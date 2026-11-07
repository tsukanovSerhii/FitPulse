import { isAnyOf, type UnknownAction } from '@reduxjs/toolkit'
import { loginUser, registerUser, restoreSession } from '@/features/auth/model'
import { fetchBody } from '@/features/body/model'
import { fetchExercises } from '@/features/exercises/model'
import { fetchProfile } from '@/features/profile/model'
import { fetchProgress } from '@/features/progress/model'
import { runSync } from '@/features/sync/model'
import { fetchPlans } from '@/features/workoutPlan/model'
import { listenerMiddleware as listeners } from './listeners'
import type { store as appStore } from './store'

let started = false

/** Syncs after sign-in, two seconds after data changes, when back online and every minute. */
export function startSync() {
  if (started) return
  started = true

  const SYNC_DELAY_MS = 2000
  const DATA_FEATURES = /^(progress|workoutPlan|body|profile|exercises)\//

  // A finished write of account data (not a load) is worth sending to the other devices
  const isDataChange = (action: UnknownAction) =>
    action.type.endsWith('/fulfilled') && DATA_FEATURES.test(action.type) && !action.type.includes('/fetch')

  listeners.startListening({
    predicate: isDataChange,
    effect: async (_action, api) => {
      // Debounce: a burst of edits becomes one sync
      api.cancelActiveListeners()
      await api.delay(SYNC_DELAY_MS)
      await api.dispatch(runSync())
    },
  })

  listeners.startListening({
    matcher: isAnyOf(loginUser.fulfilled, registerUser.fulfilled),
    effect: async (_action, api) => {
      await api.dispatch(runSync())
    },
  })

  listeners.startListening({
    actionCreator: restoreSession.fulfilled,
    effect: async (action, api) => {
      if (action.payload && action.payload !== 'offline') await api.dispatch(runSync())
    },
  })

  // What arrived from other devices is in storage now; the slices read it again
  listeners.startListening({
    actionCreator: runSync.fulfilled,
    effect: async (action, api) => {
      if (action.payload.status !== 'synced' || !action.payload.received) return
      await Promise.all([api.dispatch(fetchExercises()), api.dispatch(fetchPlans()), api.dispatch(fetchProgress()), api.dispatch(fetchProfile()), api.dispatch(fetchBody())])
    },
  })
}

/** Browser triggers: back online and every minute while the tab is visible. */
export function startSyncTimers(store: typeof appStore) {
  const syncIfSignedIn = () => {
    if (store.getState().auth.user) void store.dispatch(runSync())
  }
  window.addEventListener('online', syncIfSignedIn)
  window.setInterval(() => {
    if (document.visibilityState === 'visible') syncIfSignedIn()
  }, 60_000)
}
