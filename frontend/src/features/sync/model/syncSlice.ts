import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { SyncOutcome } from './syncNow'

export interface SyncState {
  status: 'idle' | 'syncing' | 'synced' | 'offline' | 'error'
  lastSyncedAt: string | null
}

const initialState: SyncState = { status: 'idle', lastSyncedAt: null }

// The engine loads on the first sync, so it stays out of the entry bundle
export const runSync = createAsyncThunk<SyncOutcome>('sync/run', async () => (await import('./syncNow')).syncNow())

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(runSync.pending, (state) => {
        state.status = 'syncing'
      })
      .addCase(runSync.fulfilled, (state, action) => {
        const outcome = action.payload
        if (outcome.status === 'synced') {
          state.status = 'synced'
          state.lastSyncedAt = new Date().toISOString()
        } else state.status = outcome.status === 'signedOut' ? 'idle' : outcome.status
      })
      .addCase(runSync.rejected, (state) => {
        state.status = 'error'
      })
  },
})

export default syncSlice.reducer
