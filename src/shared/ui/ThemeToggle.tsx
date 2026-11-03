import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/features/theme/hooks/useTheme'
import type { ThemeMode } from '@/features/theme/model/types'
import { SegmentedControl, type SegmentOption } from './SegmentedControl'
import { IconButton } from './IconButton'

const OPTIONS: SegmentOption<ThemeMode>[] = [
  { value: 'light', label: <Sun />, ariaLabel: 'Світла тема' },
  { value: 'dark', label: <Moon />, ariaLabel: 'Темна тема' },
  { value: 'system', label: <Monitor />, ariaLabel: 'Як у системі' },
]

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme()
  return <SegmentedControl label="Тема оформлення" options={OPTIONS} value={mode} onChange={setMode} size="sm" className={className} />
}

const NEXT: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'system', system: 'light' }
const ICON = { light: <Sun />, dark: <Moon />, system: <Monitor /> }
const LABEL = { light: 'Світла тема', dark: 'Темна тема', system: 'Тема як у системі' }

export function ThemeCycleButton({ className }: { className?: string }) {
  const { mode, setMode } = useTheme()
  return (
    <IconButton
      label={`${LABEL[mode]}. Натисніть, щоб змінити`}
      icon={ICON[mode]}
      onClick={() => setMode(NEXT[mode])}
      className={className}
    />
  )
}
