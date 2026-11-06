import { describe, expect, it } from 'vitest'
import themeReducer, { resolveTheme, setThemeMode, systemThemeChanged } from './themeSlice'
import type { ThemeState } from './types'

describe('theme', () => {
  it('resolves system mode from the OS preference', () => {
    expect(resolveTheme('system', 'light')).toBe('light')
    expect(resolveTheme('system', 'dark')).toBe('dark')
    expect(resolveTheme('dark', 'light')).toBe('dark')
  })

  it('follows OS changes only in system mode', () => {
    const system: ThemeState = { mode: 'system', resolved: 'dark' }
    expect(themeReducer(system, systemThemeChanged('light')).resolved).toBe('light')

    const fixed: ThemeState = { mode: 'dark', resolved: 'dark' }
    expect(themeReducer(fixed, systemThemeChanged('light')).resolved).toBe('dark')
  })

  it('setThemeMode updates mode and resolved theme', () => {
    const state: ThemeState = { mode: 'dark', resolved: 'dark' }
    expect(themeReducer(state, setThemeMode({ mode: 'system', system: 'light' }))).toEqual({
      mode: 'system',
      resolved: 'light',
    })
  })
})
