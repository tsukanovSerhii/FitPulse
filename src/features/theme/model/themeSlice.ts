import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ResolvedTheme, ThemeMode, ThemeState } from './types'
import { loadFromStorage, STORAGE_KEYS } from '@/shared/storage/localStorage'

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(mode: ThemeMode, system: ResolvedTheme): ResolvedTheme {
  return mode === 'system' ? system : mode
}

const storedMode = loadFromStorage<ThemeMode>(STORAGE_KEYS.THEME, 'system')
const initialMode: ThemeMode = THEME_MODES.includes(storedMode) ? storedMode : 'system'

const initialState: ThemeState = {
  mode: initialMode,
  resolved: resolveTheme(initialMode, getSystemTheme()),
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<{ mode: ThemeMode; system: ResolvedTheme }>) => {
      state.mode = action.payload.mode
      state.resolved = resolveTheme(action.payload.mode, action.payload.system)
    },
    systemThemeChanged: (state, action: PayloadAction<ResolvedTheme>) => {
      if (state.mode === 'system') state.resolved = action.payload
    },
  },
})

export const { setThemeMode, systemThemeChanged } = themeSlice.actions

export default themeSlice.reducer
