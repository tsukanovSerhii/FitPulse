export interface ChartPoint {
  key: string
  /** Short axis label */
  label: string
  /** Tooltip heading, e.g. the full date */
  title: string
  value: number
  /** Optional second line in the tooltip */
  detail?: string
}

/** Value first, label second: the reader already knows the series and wants the number. */
export function ChartTooltip({ point, value, x, y, width }: { point: ChartPoint; value: string; x: number; y: number; width: number }) {
  const left = Math.min(Math.max(x, 70), width - 70)
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-line bg-surface px-3 py-2 text-center shadow-pop"
      style={{ left, top: y - 10 }}
    >
      <div className="font-mono text-sm font-semibold text-fg tabular">{value}</div>
      <div className="whitespace-nowrap text-xs text-fg-subtle">{point.title}</div>
      {point.detail && <div className="whitespace-nowrap text-xs text-fg-muted">{point.detail}</div>}
    </div>
  )
}
