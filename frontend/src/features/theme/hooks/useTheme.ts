import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { saveToStorage, STORAGE_KEYS } from '@/shared/storage/localStorage'
import { getSystemTheme, setThemeMode, systemThemeChanged } from '../model/themeSlice'
import type { ResolvedTheme, ThemeMode } from '../model/types'

const META_THEME_COLOR = { light: '#f4f4f2', dark: '#0e0e10' } as const

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('light', resolved === 'light')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_THEME_COLOR[resolved])
}

/** Cross-fades the whole page into the new theme where the browser can (View Transitions). */
function withThemeTransition(change: () => void) {
  const calm = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (typeof document.startViewTransition !== 'function' || calm) {
    change()
    return
  }
  document.startViewTransition(change)
}

/** Syncs the theme with the document. Call once at the app root. */
export function useThemeSync() {
  const dispatch = useAppDispatch()
  const { mode, resolved } = useAppSelector((state) => state.theme)

  useEffect(() => applyTheme(resolved), [resolved])

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
    (next: ThemeMode) => {
      const system = getSystemTheme()
      // The document changes inside the transition, so the browser captures both themes
      withThemeTransition(() => {
        applyTheme(next === 'system' ? system : next)
        dispatch(setThemeMode({ mode: next, system }))
      })
    },
    [dispatch],
  )

  return { mode, resolved, setMode }
}
