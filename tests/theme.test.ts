import { describe, expect, it } from 'vitest'
import themeReducer, { resolveTheme, setThemeMode, systemThemeChanged } from '@/features/theme/model/themeSlice'
import type { ThemeState } from '@/features/theme/model/types'

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

describe('formatNumber', () => {
  it('groups thousands with a narrow no-break space', async () => {
    const { formatNumber } = await import('@/shared/lib/formatters')
    expect(formatNumber(12480)).toBe('12\u202f480')
    expect(formatNumber(1.25, 1)).toBe('1,3')
  })
})
