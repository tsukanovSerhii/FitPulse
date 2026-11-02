export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeState {
  /** Вибір користувача */
  mode: ThemeMode
  /** Фактична тема, що застосована до сторінки */
  resolved: ResolvedTheme
}
