import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from './format.ts'

export function Button({ tone = 'default', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'default' | 'primary' | 'danger' }) {
  const tones = {
    default: 'border border-line bg-surface text-fg hover:bg-surface-2',
    primary: 'bg-accent text-white hover:opacity-90',
    danger: 'bg-danger text-white hover:opacity-90',
  }
  return (
    <button
      type="button"
      className={cx('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50', tones[tone], className)}
      {...props}
    />
  )
}

export function Card({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('space-y-4 rounded-xl border border-line bg-surface p-5 shadow-sm', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold text-fg-muted">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export const ErrorText = ({ children }: { children: ReactNode }) => (
  <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
    {children}
  </p>
)

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'good' | 'danger' | 'warn' | 'accent'; children: ReactNode }) {
  const tones = {
    neutral: 'bg-surface-2 text-fg-muted',
    good: 'bg-good-soft text-good',
    danger: 'bg-danger-soft text-danger',
    warn: 'bg-warn-soft text-warn',
    accent: 'bg-accent-soft text-accent',
  }
  return <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
}

/** A headline number with its change against the previous period. */
export function StatTile({ label, value, previous, format = (n) => String(n) }: { label: string; value: number | null; previous?: number; format?: (n: number) => string }) {
  const change = value !== null && previous !== undefined && previous > 0 ? Math.round(((value - previous) / previous) * 100) : null
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <p className="text-xs font-medium text-fg-subtle">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value === null ? '—' : format(value)}</p>
      {change !== null && (
        <p className={cx('mt-1 text-xs font-medium', change > 0 ? 'text-good' : change < 0 ? 'text-danger' : 'text-fg-subtle')}>
          {change > 0 ? '▲' : change < 0 ? '▼' : '•'} {Math.abs(change)}% до попереднього періоду
        </p>
      )}
    </div>
  )
}

/** Segmented 7 / 30 / 90 days switch. */
export function PeriodSwitch({ value, onChange }: { value: number; onChange: (days: 7 | 30 | 90) => void }) {
  return (
    <div role="radiogroup" aria-label="Період" className="inline-flex rounded-lg border border-line bg-surface p-0.5 text-sm">
      {([7, 30, 90] as const).map((days) => (
        <button
          key={days}
          type="button"
          role="radio"
          aria-checked={value === days}
          onClick={() => onChange(days)}
          className={cx('rounded-md px-3 py-1', value === days ? 'bg-accent text-white' : 'text-fg-muted hover:text-fg')}
        >
          {days} днів
        </button>
      ))}
    </div>
  )
}

/** A chart with the same numbers as a table, for screen readers and exact values. */
export function ChartFigure({ title, columns, rows, children }: { title: string; columns: string[]; rows: (string | number)[][]; children: ReactNode }) {
  return (
    <Card title={title}>
      <div aria-hidden="true">{children}</div>
      <details className="text-sm">
        <summary className="cursor-pointer text-fg-subtle hover:text-fg">Таблиця даних</summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <caption className="sr-only">{title}</caption>
            <thead className="text-fg-subtle">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="py-1 pr-4 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row[0])} className="border-t border-line">
                  {row.map((cell, i) => (
                    <td key={i} className="py-1 pr-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  )
}
