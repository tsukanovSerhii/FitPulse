import { useSyncExternalStore } from 'react'

export interface TimerSettings {
  /** exercise: rest from the plan or exercise; fixed: the same rest after every set */
  restMode: 'exercise' | 'fixed'
  fixedSeconds: number
  /** Start the rest right after a set is logged */
  autoStart: boolean
  sound: boolean
  vibration: boolean
  /** Seconds the −/+ buttons change the rest by */
  step: 15 | 30
  /** Show the general warm-up before the first exercise */
  warmupReminder: boolean
  /** Show "Відпочинок до 14:32" on the lock screen when the phone locks mid-rest */
  restNotifications: boolean
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  restMode: 'exercise',
  fixedSeconds: 90,
  autoStart: true,
  sound: true,
  vibration: true,
  step: 15,
  warmupReminder: true,
  restNotifications: false,
}

export const REST_LIMITS = { min: 15, max: 600, step: 15 }

const KEY = 'fitpulse_timer_settings_v1'
// Sound was a separate switch before these settings existed
const LEGACY_SOUND_KEY = 'fitpulse_sound_enabled'

function read(): TimerSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_TIMER_SETTINGS, ...(JSON.parse(raw) as Partial<TimerSettings>) }
    return { ...DEFAULT_TIMER_SETTINGS, sound: localStorage.getItem(LEGACY_SOUND_KEY) !== 'false' }
  } catch {
    return DEFAULT_TIMER_SETTINGS
  }
}

let current: TimerSettings | null = null
const listeners = new Set<() => void>()

export function getTimerSettings(): TimerSettings {
  return (current ??= read())
}

export function updateTimerSettings(patch: Partial<TimerSettings>) {
  current = { ...getTimerSettings(), ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    // without storage the settings last until reload
  }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Timer settings of this device; every screen that reads them updates together. */
export function useTimerSettings(): TimerSettings {
  return useSyncExternalStore(subscribe, getTimerSettings, getTimerSettings)
}

/** Rest after a set of this entry under the current settings. */
export const restFor = (settings: TimerSettings, exerciseRest: number) =>
  settings.restMode === 'fixed' ? settings.fixedSeconds : exerciseRest
