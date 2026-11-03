import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { saveToStorage, STORAGE_KEYS } from '@/shared/storage/localStorage'
import { getSystemTheme, setThemeMode, systemThemeChanged } from '../model/themeSlice'
import type { ThemeMode } from '../model/types'

const META_THEME_COLOR = { light: '#f4f4f2', dark: '#0e0e10' } as const

/** Syncs the theme with the document. Call once at the app root. */
export function useThemeSync() {
  const dispatch = useAppDispatch()
  const { mode, resolved } = useAppSelector((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolved === 'dark')
    root.classList.toggle('light', resolved === 'light')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_THEME_COLOR[resolved])
  }, [resolved])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.THEME, mode)
  }, [mode])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      dispatch(systemThemeChanged(event.matches ? 'dark' : 'light'))
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [dispatch])
}

export function useTheme() {
  const dispatch = useAppDispatch()
  const { mode, resolved } = useAppSelector((state) => state.theme)

  const setMode = useCallback(
    (next: ThemeMode) => dispatch(setThemeMode({ mode: next, system: getSystemTheme() })),
    [dispatch],
  )

  return { mode, resolved, setMode }
}
