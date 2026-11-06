import { calculateBMI } from '../lib/bmi'
import { formatNumber } from '@/shared/lib/formatters'
import { cn } from '@/shared/lib/cn'
import type { UserProfile } from '../model/types'

const SCALE_MIN = 15
const SCALE_MAX = 35
const ZONES = [
  { to: 18.5, className: 'bg-warning/60' },
  { to: 25, className: 'bg-success/70' },
  { to: 30, className: 'bg-warning/60' },
  { to: SCALE_MAX, className: 'bg-danger/60' },
]

const toPercent = (value: number) => ((Math.min(SCALE_MAX, Math.max(SCALE_MIN, value)) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100

export function BMISummary({ profile }: { profile: UserProfile }) {
  const result = calculateBMI(profile)

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-5xl font-semibold text-fg tabular">{formatNumber(result.bmi, 1)}</p>
          <p className={cn('mt-1 text-sm font-semibold', result.color)}>{result.category}</p>
        </div>
        <p className="max-w-[16rem] text-right text-xs text-fg-muted">{result.description}</p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
            {ZONES.map((zone, i) => {
              const from = i === 0 ? SCALE_MIN : ZONES[i - 1].to
              return <span key={zone.to} className={zone.className} style={{ width: `${toPercent(zone.to) - toPercent(from)}%` }} />
            })}
          </div>
          <span
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-fg"
            style={{ left: `${toPercent(result.bmi)}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="flex justify-between font-mono text-[10px] text-fg-subtle tabular" aria-hidden="true">
          <span>{SCALE_MIN}</span>
          <span>18,5</span>
          <span>25</span>
          <span>30</span>
          <span>{SCALE_MAX}</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 divide-x divide-line rounded-lg border border-line">
        <div className="p-4">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">Здорова вага</dt>
          <dd className="mt-1 font-mono text-lg text-fg tabular">
            {formatNumber(result.healthyWeightMin, 1)}–{formatNumber(result.healthyWeightMax, 1)}
            <span className="ml-1 text-xs text-fg-subtle">кг</span>
          </dd>
        </div>
        <div className="p-4">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">Калорії на день</dt>
          <dd className="mt-1 font-mono text-lg text-fg tabular">
            ~{formatNumber(result.dailyCalorieEstimate)}
            <span className="ml-1 text-xs text-fg-subtle">ккал</span>
          </dd>
        </div>
      </dl>
    </div>
  )
}
