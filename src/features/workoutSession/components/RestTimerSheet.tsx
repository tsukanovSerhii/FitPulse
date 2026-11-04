import { useState } from 'react'
import { Pause, Play, Settings2, Volume2, VolumeX } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { Button, IconButton, Modal, ProgressRing } from '@/shared/ui'
import { updateTimerSettings, useTimerSettings } from '../lib/timerSettings'
import { TimerSettingsPanel } from './TimerSettingsPanel'
import { formatDuration } from '@/shared/lib/formatters'
import {
  addRestSeconds,
  skipRestTimer,
  subtractRestSeconds,
  toggleRestTimer,
} from '../model/workoutSessionSlice'

export function RestTimerSheet({ nextHint }: { nextHint?: string }) {
  const dispatch = useAppDispatch()
  const timer = useAppSelector((state) => state.workoutSession.restTimer)
  // Ticking and the end signal live in useSessionClock, so they keep going when this sheet is not shown
  const settings = useTimerSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (timer.remainingSeconds <= 0) return null

  const percent = timer.totalSeconds > 0 ? (timer.remainingSeconds / timer.totalSeconds) * 100 : 0

  return (
    <section
      aria-label="Відпочинок"
      className="fixed inset-x-0 bottom-0 z-[60] animate-rise rounded-t-lg border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-pop"
    >
      <div className="mx-auto max-w-lg space-y-5 px-5 pb-5 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Відпочинок</span>
          <span className="flex items-center gap-1">
            <IconButton
              size="sm"
              label={settings.sound ? 'Вимкнути звук' : 'Увімкнути звук'}
              icon={settings.sound ? <Volume2 /> : <VolumeX />}
              onClick={() => updateTimerSettings({ sound: !settings.sound })}
            />
            <IconButton size="sm" label="Налаштування таймера" icon={<Settings2 />} onClick={() => setSettingsOpen(true)} />
          </span>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => dispatch(subtractRestSeconds(settings.step))}
            className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-surface-2 font-mono text-sm font-semibold text-fg active:bg-line-strong"
            aria-label={`Мінус ${settings.step} секунд`}
          >
            −{settings.step}
          </button>
          <ProgressRing value={percent} label="Залишок відпочинку" size={150} stroke={5}>
            <span className="font-mono text-4xl font-semibold text-fg tabular" aria-live="off">
              {formatDuration(timer.remainingSeconds)}
            </span>
            <button
              type="button"
              onClick={() => dispatch(toggleRestTimer())}
              aria-label={timer.isRunning ? 'Пауза' : 'Продовжити'}
              className="mt-1 flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-muted hover:text-fg"
            >
              {timer.isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
          </ProgressRing>
          <button
            type="button"
            onClick={() => dispatch(addRestSeconds(settings.step))}
            className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-surface-2 font-mono text-sm font-semibold text-fg active:bg-line-strong"
            aria-label={`Плюс ${settings.step} секунд`}
          >
            +{settings.step}
          </button>
        </div>

        {nextHint && <p className="text-center text-sm text-fg-muted">Далі: {nextHint}</p>}

        <Button variant="secondary" size="lg" className="w-full" onClick={() => dispatch(skipRestTimer())}>
          Пропустити
        </Button>
      </div>

      <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="Таймер відпочинку" maxWidth="md">
        <div className="-mx-5 -my-5 sm:-mx-6">
          <TimerSettingsPanel />
        </div>
      </Modal>
    </section>
  )
}
