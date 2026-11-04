import type { ReactNode } from 'react'
import { NumberStepper, SegmentedControl } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatDuration } from '@/shared/lib/formatters'
import { REST_LIMITS, updateTimerSettings, useTimerSettings } from '../lib/timerSettings'

function Switch({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <Row label={label} hint={hint}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-line-strong',
        )}
      >
        <span className={cn('absolute left-0 top-0.5 size-6 rounded-full bg-surface shadow-sm transition-transform', checked ? 'translate-x-5.5' : 'translate-x-0.5')} />
      </button>
    </Row>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 sm:px-6">
      <span className="min-w-0">
        <span className="block text-sm text-fg">{label}</span>
        {hint && <span className="block text-xs text-fg-subtle">{hint}</span>}
      </span>
      {children}
    </div>
  )
}

/** Rest timer settings, shared by the profile page and the rest timer itself. */
export function TimerSettingsPanel() {
  const settings = useTimerSettings()

  return (
    <div className="divide-y divide-line">
      <Row label="Час відпочинку" hint={settings.restMode === 'fixed' ? 'Однаковий після кожного підходу' : 'Як указано у вправі чи програмі'}>
        <SegmentedControl
          label="Час відпочинку"
          size="sm"
          value={settings.restMode}
          onChange={(restMode) => updateTimerSettings({ restMode })}
          options={[
            { value: 'exercise', label: 'З програми' },
            { value: 'fixed', label: 'Свій' },
          ]}
        />
      </Row>

      {settings.restMode === 'fixed' && (
        <div className="p-4 sm:px-6">
          <NumberStepper
            label={`Відпочинок · ${formatDuration(settings.fixedSeconds)}`}
            unit="с"
            value={settings.fixedSeconds}
            step={REST_LIMITS.step}
            min={REST_LIMITS.min}
            max={REST_LIMITS.max}
            onChange={(fixedSeconds) => updateTimerSettings({ fixedSeconds })}
          />
        </div>
      )}

      <Switch
        label="Запускати автоматично"
        hint="Відпочинок стартує одразу після підходу"
        checked={settings.autoStart}
        onChange={(autoStart) => updateTimerSettings({ autoStart })}
      />
      <Switch label="Звук наприкінці" checked={settings.sound} onChange={(sound) => updateTimerSettings({ sound })} />
      <Switch label="Вібрація наприкінці" checked={settings.vibration} onChange={(vibration) => updateTimerSettings({ vibration })} />

      <Switch
        label="Розминка перед тренуванням"
        hint="Коротка нагадалка на старті: кардіо, суглоби, рухи без ваги"
        checked={settings.warmupReminder}
        onChange={(warmupReminder) => updateTimerSettings({ warmupReminder })}
      />

      <Row label="Крок кнопок −/+">
        <SegmentedControl
          label="Крок кнопок"
          size="sm"
          value={String(settings.step) as '15' | '30'}
          onChange={(step) => updateTimerSettings({ step: Number(step) as 15 | 30 })}
          options={[
            { value: '15', label: '15 с' },
            { value: '30', label: '30 с' },
          ]}
        />
      </Row>
    </div>
  )
}
