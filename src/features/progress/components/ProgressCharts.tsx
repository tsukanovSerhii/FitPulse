import { useMemo, useState } from 'react'
import { BarChart, LineChart, type ChartPoint, type LinePoint } from '@/shared/ui/charts'
import { Section, Select } from '@/shared/ui'
import { formatNumber } from '@/shared/lib/formatters'
import { exerciseWeightHistory, trackedExercises, weeklyVolume } from '../lib/charts'
import type { WorkoutHistoryLog } from '../model/types'

const shortDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' })
const longDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })

const compactKg = (kg: number) => (kg >= 1000 ? `${formatNumber(kg / 1000, 1)}т` : formatNumber(kg))

function ViewToggle({ table, onChange }: { table: boolean; onChange: (table: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!table)} className="cursor-pointer text-xs font-semibold text-fg-muted hover:text-fg">
      {table ? 'Графік' : 'Таблиця'}
    </button>
  )
}

function DataTable({ caption, head, rows }: { caption: string; head: [string, string]; rows: [string, string][] }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="text-left text-xs text-fg-subtle">
          <th className="pb-2 font-semibold">{head[0]}</th>
          <th className="pb-2 text-right font-semibold">{head[1]}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td className="py-2 text-fg">{label}</td>
            <td className="py-2 text-right font-mono text-fg tabular">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function ProgressCharts({ history }: { history: WorkoutHistoryLog[] }) {
  const [volumeAsTable, setVolumeAsTable] = useState(false)
  const [weightAsTable, setWeightAsTable] = useState(false)
  const exercises = useMemo(() => trackedExercises(history), [history])
  const [picked, setPicked] = useState<string | null>(null)
  const exerciseId = picked && exercises.some((e) => e.id === picked) ? picked : exercises[0]?.id

  const volume: ChartPoint[] = useMemo(
    () =>
      weeklyVolume(history).map((week) => ({
        key: week.weekStart.toISOString(),
        label: shortDate.format(week.weekStart),
        title: `Тиждень з ${shortDate.format(week.weekStart)}`,
        value: week.volumeKg,
        detail: week.workouts ? `${week.workouts} трен.` : 'без тренувань',
      })),
    [history],
  )

  const weight: LinePoint[] = useMemo(
    () =>
      exerciseId
        ? exerciseWeightHistory(history, exerciseId).map((point) => ({
            key: point.date.toISOString(),
            x: point.date.getTime(),
            label: shortDate.format(point.date),
            title: longDate.format(point.date),
            value: point.weightKg,
            detail: point.reps ? `на ${point.reps} повт.` : undefined,
          }))
        : [],
    [history, exerciseId],
  )

  const exerciseName = exercises.find((e) => e.id === exerciseId)?.name ?? ''

  return (
    <>
      <Section title="Тоннаж по тижнях" aside={<ViewToggle table={volumeAsTable} onChange={setVolumeAsTable} />}>
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          {volumeAsTable ? (
            <DataTable
              caption="Тоннаж по тижнях"
              head={['Тиждень', 'Тоннаж']}
              rows={volume.map((p) => [p.title, `${formatNumber(p.value)} кг`])}
            />
          ) : (
            <BarChart
              data={volume}
              ariaLabel="Тоннаж по тижнях за останні 12 тижнів"
              formatValue={(v) => `${formatNumber(v)} кг`}
              formatTick={compactKg}
            />
          )}
        </div>
      </Section>

      {exercises.length > 0 && (
        <Section title="Вага у вправі" aside={<ViewToggle table={weightAsTable} onChange={setWeightAsTable} />}>
          <div className="space-y-4 rounded-lg border border-line bg-surface p-4 sm:p-5">
            <Select
              aria-label="Вправа"
              value={exerciseId}
              onChange={(e) => setPicked(e.target.value)}
              options={exercises.map((e) => ({ value: e.id, label: e.name }))}
            />
            {weightAsTable ? (
              <DataTable
                caption={`Найкраща вага: ${exerciseName}`}
                head={['Дата', 'Вага']}
                rows={weight.map((p) => [p.title, `${formatNumber(p.value, 1)} кг${p.detail ? ` ${p.detail}` : ''}`])}
              />
            ) : weight.length < 2 ? (
              <p className="py-8 text-center text-sm text-fg-muted">
                Потрібно щонайменше два тренування з цією вправою, щоб побачити динаміку.
              </p>
            ) : (
              <LineChart
                data={weight}
                ariaLabel={`Найкраща вага в підході: ${exerciseName}`}
                formatValue={(v) => `${formatNumber(v, 1)} кг`}
                formatTick={(v) => formatNumber(v, 1)}
              />
            )}
          </div>
        </Section>
      )}
    </>
  )
}
