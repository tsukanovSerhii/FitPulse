import { useState } from 'react'
import { linearScale, niceTicks } from '../../lib/scale'
import { ChartTooltip, type ChartPoint } from './ChartTooltip'
import { useElementWidth } from './useElementWidth'

export interface BarChartProps {
  data: ChartPoint[]
  formatValue: (value: number) => string
  formatTick?: (value: number) => string
  ariaLabel: string
  height?: number
}

const MARGIN = { top: 24, right: 8, bottom: 24, left: 40 }
const RADIUS = 4

/** Column path with a rounded data end and a square base on the baseline. */
function columnPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(RADIUS, h, w / 2)
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`
}

export function BarChart({ data, formatValue, formatTick = formatValue, ariaLabel, height = 200 }: BarChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const ticks = niceTicks(0, Math.max(0, ...data.map((d) => d.value)))
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right)
  const innerH = height - MARGIN.top - MARGIN.bottom
  const y = linearScale([0, ticks[ticks.length - 1]], [MARGIN.top + innerH, MARGIN.top])
  const band = data.length ? innerW / data.length : 0
  const barW = Math.min(24, band * 0.6)
  // Thin out x labels so they never collide
  const labelEvery = Math.max(1, Math.ceil(44 / Math.max(band, 1)))
  const lastIndex = data.findLastIndex((d) => d.value > 0)

  return (
    <div ref={ref} className="relative" onPointerLeave={() => setActive(null)}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} stroke="var(--line)" />
              <text x={MARGIN.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-fg-subtle font-mono text-[10px]">
                {formatTick(tick)}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const cx = MARGIN.left + band * i + band / 2
            const top = y(d.value)
            const h = MARGIN.top + innerH - top
            return (
              <g key={d.key}>
                {h > 0 && (
                  <path
                    d={columnPath(cx - barW / 2, top, barW, h)}
                    fill="var(--chart-mark)"
                    opacity={active === null || active === i ? 1 : 0.55}
                    className="transition-opacity"
                  />
                )}
                {i === lastIndex && active === null && (
                  <text x={cx} y={top - 6} textAnchor="middle" className="fill-fg-muted font-mono text-[11px]">
                    {formatTick(d.value)}
                  </text>
                )}
                {i % labelEvery === (data.length - 1) % labelEvery && (
                  <text x={cx} y={height - 6} textAnchor="middle" className="fill-fg-subtle text-[10px]">
                    {d.label}
                  </text>
                )}
                {/* The whole column band is the hit target, not just the painted bar */}
                <rect
                  x={cx - band / 2}
                  y={MARGIN.top}
                  width={band}
                  height={innerH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${d.title}: ${formatValue(d.value)}`}
                  className="cursor-default outline-none focus-visible:stroke-accent"
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                />
              </g>
            )
          })}
        </svg>
      )}
      {active !== null && data[active] && (
        <ChartTooltip
          point={data[active]}
          value={formatValue(data[active].value)}
          x={MARGIN.left + band * active + band / 2}
          y={y(data[active].value)}
          width={width}
        />
      )}
    </div>
  )
}
