import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ThemeMode, ThemeState } from './types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/services/storage/localStorage'

const savedTheme = loadFromStorage<ThemeMode>(STORAGE_KEYS.THEME, 'dark')

function applyThemeToDOM(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  if (mode === 'light') {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  } else {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  }
}

// Застосовуємо тему до DOM при першому завантаженні
applyThemeToDOM(savedTheme)

const initialState: ThemeState = {
  mode: savedTheme,
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      saveToStorage(STORAGE_KEYS.THEME, state.mode)
      applyThemeToDOM(state.mode)
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      saveToStorage(STORAGE_KEYS.THEME, state.mode)
      applyThemeToDOM(state.mode)
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions

export default themeSlice.reducer
