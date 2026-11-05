import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui'
import { BODY_METRICS, type BodyEntry, type BodyMetric } from '../model/types'

const today = () => new Date().toISOString().slice(0, 10)

/** New measurement: any of weight and girths, at least one; the date defaults to today. */
export function BodyEntryForm({ onSave }: { onSave: (entry: Omit<BodyEntry, 'id'>) => Promise<void> }) {
  const [date, setDate] = useState(today)
  const [values, setValues] = useState<Partial<Record<BodyMetric, string>>>({})
  const [saving, setSaving] = useState(false)

  const filled = Object.entries(values).filter(([, v]) => v && Number(v) > 0) as [BodyMetric, string][]

  const save = async () => {
    setSaving(true)
    try {
      await onSave({ date: new Date(`${date}T12:00:00`).toISOString(), ...Object.fromEntries(filled.map(([k, v]) => [k, Number(v)])) })
      setValues({})
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (filled.length > 0) save()
      }}
      className="space-y-4 rounded-lg border border-line bg-surface p-4 sm:p-5"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="col-span-2 space-y-1 text-xs font-semibold text-fg-subtle sm:col-span-1">
          Дата
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value || today())}
            className="h-11 w-full rounded-md border border-line bg-surface-2 px-3 text-sm text-fg focus:border-accent focus:outline-none"
          />
        </label>
        {BODY_METRICS.map((metric) => (
          <label key={metric.key} className="min-w-0 space-y-1 text-xs font-semibold text-fg-subtle">
            {metric.label}, {metric.unit}
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={metric.step}
              placeholder="—"
              value={values[metric.key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [metric.key]: e.target.value }))}
              className="h-11 w-full min-w-0 rounded-md border border-line bg-surface-2 px-3 font-mono text-sm text-fg tabular focus:border-accent focus:outline-none"
            />
          </label>
        ))}
      </div>
      <Button type="submit" icon={<Plus />} disabled={filled.length === 0 || saving} className="w-full sm:w-auto">
        Додати вимір
      </Button>
    </form>
  )
}
