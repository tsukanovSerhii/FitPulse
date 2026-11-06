import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { bodyApi } from '../api/bodyApi'
import type { BodyEntry, BodyState } from './types'

const initialState: BodyState = { entries: [], status: 'idle' }

export const fetchBody = createAsyncThunk('body/fetch', () => bodyApi.getEntries())
export const addBodyEntry = createAsyncThunk('body/add', (entry: Omit<BodyEntry, 'id'>) => bodyApi.addEntry(entry))
export const removeBodyEntry = createAsyncThunk('body/remove', (id: string) => bodyApi.removeEntry(id))

const bodySlice = createSlice({
  name: 'body',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBody.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchBody.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.entries = action.payload
      })
      .addCase(fetchBody.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(addBodyEntry.fulfilled, (state, action) => {
        state.entries = action.payload
      })
      .addCase(removeBodyEntry.fulfilled, (state, action) => {
        state.entries = action.payload
      })
  },
})

export default bodySlice.reducer
