import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ThemeMode, ThemeState } from './types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/services/storage/localStorage'

const savedTheme = loadFromStorage<ThemeMode>(STORAGE_KEYS.THEME, 'dark')

const initialState: ThemeState = {
  mode: savedTheme,
}

// Застосовуємо тему до DOM
if (typeof document !== 'undefined') {
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      saveToStorage(STORAGE_KEYS.THEME, state.mode)
      if (typeof document !== 'undefined') {
        if (state.mode === 'light') {
          document.documentElement.classList.add('light')
        } else {
          document.documentElement.classList.remove('light')
        }
      }
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      saveToStorage(STORAGE_KEYS.THEME, state.mode)
      if (typeof document !== 'undefined') {
        if (state.mode === 'light') {
          document.documentElement.classList.add('light')
        } else {
          document.documentElement.classList.remove('light')
        }
      }
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions

export default themeSlice.reducer
