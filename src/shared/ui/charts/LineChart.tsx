import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import { linearScale, niceTicks } from '../../lib/scale'
import { ChartTooltip, type ChartPoint } from './ChartTooltip'
import { useElementWidth } from './useElementWidth'

export interface LinePoint extends ChartPoint {
  /** Position on the time axis, e.g. a timestamp */
  x: number
}

export interface LineChartProps {
  data: LinePoint[]
  formatValue: (value: number) => string
  formatTick?: (value: number) => string
  ariaLabel: string
  height?: number
}

const MARGIN = { top: 24, right: 16, bottom: 24, left: 40 }

export function LineChart({ data, formatValue, formatTick = formatValue, ariaLabel, height = 200 }: LineChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const values = data.map((d) => d.value)
  const ticks = niceTicks(Math.min(...values), Math.max(...values))
  const innerH = height - MARGIN.top - MARGIN.bottom
  const xs = data.map((d) => d.x)
  const x = linearScale([Math.min(...xs), Math.max(...xs)], data.length > 1 ? [MARGIN.left + 8, width - MARGIN.right] : [width / 2, width / 2])
  const y = linearScale([ticks[0], ticks[ticks.length - 1]], [MARGIN.top + innerH, MARGIN.top])
  const points = data.map((d) => ({ px: x(d.x), py: y(d.value) }))
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${p.px},${p.py}`).join('')

  // The crosshair finds the nearest point by x, so the pointer never has to hit the line
  const nearest = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left
    let best = 0
    points.forEach((p, i) => {
      if (Math.abs(p.px - px) < Math.abs(points[best].px - px)) best = i
    })
    return best
  }

  const onPointerMove = (event: PointerEvent<SVGRectElement>) => setActive(nearest(event.clientX, event.currentTarget.ownerSVGElement!.getBoundingClientRect()))

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const step = event.key === 'ArrowRight' ? 1 : -1
    setActive((current) => Math.min(data.length - 1, Math.max(0, (current ?? data.length - 1) + (current === null ? 0 : step))))
  }

  const last = data.length - 1

  return (
    <div ref={ref} className="relative">
      {width > 0 && data.length > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} stroke="var(--line)" />
              <text x={MARGIN.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-fg-subtle font-mono text-[10px]">
                {formatTick(tick)}
              </text>
            </g>
          ))}

          <text x={points[0].px} y={height - 6} textAnchor="start" className="fill-fg-subtle text-[10px]">
            {data[0].label}
          </text>
          {last > 0 && (
            <text x={points[last].px} y={height - 6} textAnchor="end" className="fill-fg-subtle text-[10px]">
              {data[last].label}
            </text>
          )}

          {active !== null && (
            <line x1={points[active].px} x2={points[active].px} y1={MARGIN.top} y2={MARGIN.top + innerH} stroke="var(--line-strong)" />
          )}

          <path d={path} fill="none" stroke="var(--chart-mark)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle
              key={data[i].key}
              cx={p.px}
              cy={p.py}
              r={i === active ? 5 : 4}
              fill="var(--chart-mark)"
              stroke="var(--surface)"
              strokeWidth={2}
            />
          ))}

          {active === null && (
            <text x={points[last].px} y={points[last].py - 12} textAnchor="end" className="fill-fg-muted font-mono text-[11px]">
              {formatTick(data[last].value)}
            </text>
          )}

          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={Math.max(0, width - MARGIN.left - MARGIN.right)}
            height={innerH}
            fill="transparent"
            tabIndex={0}
            aria-label={`${ariaLabel}. Стрілки вліво і вправо перемикають точки`}
            className="outline-none focus-visible:stroke-accent"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(last)}
            onBlur={() => setActive(null)}
            onKeyDown={onKeyDown}
          />
        </svg>
      )}
      {active !== null && data[active] && (
        <ChartTooltip point={data[active]} value={formatValue(data[active].value)} x={points[active].px} y={points[active].py} width={width} />
      )}
    </div>
  )
}
