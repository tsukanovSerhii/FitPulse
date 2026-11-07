import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDay } from './format.ts'

export interface Series {
  key: string
  label: string
  /** CSS variable of a validated categorical slot, in fixed order */
  color: string
}

const axis = { stroke: 'var(--fg-subtle)', fontSize: 11, tickLine: false, axisLine: false } as const
const grid = <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
const tooltipStyle = {
  contentStyle: { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12, color: 'var(--fg)' },
  labelStyle: { color: 'var(--fg-muted)' },
  labelFormatter: (day: unknown) => formatDay(String(day)),
}

/** Change over time for one or a few series on one axis. */
export function TimeLines<T extends { day: string }>({ data, series, height = 240 }: { data: T[]; series: Series[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 600, height }}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        {grid}
        <XAxis dataKey="day" tickFormatter={formatDay} minTickGap={24} {...axis} />
        <YAxis allowDecimals={false} width={44} {...axis} />
        <Tooltip {...tooltipStyle} cursor={{ stroke: 'var(--fg-subtle)', strokeWidth: 1 }} />
        {series.length > 1 && <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: 'var(--fg-muted)' }} />}
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

/** Counts per day for a single measure. */
export function DayBars<T extends { day: string }>({ data, series, height = 220 }: { data: T[]; series: Series; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 600, height }}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
        {grid}
        <XAxis dataKey="day" tickFormatter={formatDay} minTickGap={24} {...axis} />
        <YAxis allowDecimals={false} width={44} {...axis} />
        <Tooltip {...tooltipStyle} cursor={{ fill: 'var(--surface-2)' }} />
        <Bar dataKey={series.key} name={series.label} fill={series.color} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Shares of a whole as labelled horizontal bars: easier to compare than a pie, and readable without colour. */
export function RankBars({ items, total }: { items: { name: string; count: number }[]; total?: number }) {
  const sum = total ?? items.reduce((s, i) => s + i.count, 0)
  if (items.length === 0) return <p className="text-sm text-fg-subtle">Поки немає даних</p>
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const share = sum > 0 ? Math.round((item.count / sum) * 100) : 0
        return (
          <li key={item.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span className="tabular-nums text-fg-muted">
                {item.count} · {share}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-2">
              <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.max(share, 2)}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
