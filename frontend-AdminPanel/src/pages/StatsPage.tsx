import type { AdminStats, AnalyticsDevices, AnalyticsGeo, AnalyticsOverview } from '@fitpulse/contracts'
import { useState } from 'react'
import { useApi } from '../session.tsx'
import { DayBars, RankBars, TimeLines } from '../ui/charts.tsx'
import { countryName, DEVICE_LABELS, formatDay, MODE_LABELS } from '../ui/format.ts'
import { Card, ChartFigure, ErrorText, PeriodSwitch, StatTile } from '../ui/kit.tsx'

const SIGNUPS = { key: 'signups', label: 'Реєстрації', color: 'var(--series-1)' }
const ACTIVE = { key: 'active', label: 'Активні', color: 'var(--series-2)' }
const WORKOUTS = { key: 'workouts', label: 'Тренування', color: 'var(--series-3)' }
const MINUTES = { key: 'minutes', label: 'Хвилини в застосунку', color: 'var(--series-1)' }

const labelled = (items: { name: string; count: number }[], labels: Record<string, string>) => items.map((i) => ({ ...i, name: labels[i.name] ?? i.name }))

export function StatsPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30)
  const overview = useApi<AnalyticsOverview>(`/api/analytics/overview?days=${days}`)
  const devices = useApi<AnalyticsDevices>(`/api/analytics/devices?days=${days}`)
  const geo = useApi<AnalyticsGeo>(`/api/analytics/geo?days=${days}`)
  const totals = useApi<AdminStats>('/api/stats')
  const o = overview.data
  const error = overview.error ?? devices.error ?? geo.error ?? totals.error

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Огляд</h1>
          <p className="text-sm text-fg-subtle">Останні {days} днів, у порівнянні з попередніми {days}</p>
        </div>
        <PeriodSwitch value={days} onChange={setDays} />
      </div>
      {error && <ErrorText>{error}</ErrorText>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Реєстрації" value={o?.current.signups ?? null} previous={o?.previous.signups} />
        <StatTile label="Активні користувачі" value={o?.current.activeUsers ?? null} previous={o?.previous.activeUsers} />
        <StatTile label="Тренування" value={o?.current.workouts ?? null} previous={o?.previous.workouts} />
        <StatTile label="Хвилин на активного" value={o?.current.minutesPerActive ?? null} previous={o?.previous.minutesPerActive} format={(n) => n.toLocaleString('uk-UA')} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Повертаються через тиждень" value={o?.retention == null ? null : Math.round(o.retention * 100)} format={(n) => `${n}%`} />
        <StatTile label="Усього користувачів" value={totals.data?.users ?? null} />
        <StatTile label="Pro" value={totals.data?.proUsers ?? null} />
        <StatTile label="Заблоковано" value={totals.data?.blockedUsers ?? null} />
      </div>

      {o && (
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartFigure title="Реєстрації й активні за днями" columns={['День', 'Реєстрації', 'Активні']} rows={o.series.map((p) => [formatDay(p.day), p.signups, p.active])}>
            <TimeLines data={o.series} series={[SIGNUPS, ACTIVE]} />
          </ChartFigure>
          <ChartFigure title="Тренування за днями" columns={['День', 'Тренування']} rows={o.series.map((p) => [formatDay(p.day), p.workouts])}>
            <DayBars data={o.series} series={WORKOUTS} />
          </ChartFigure>
          <ChartFigure title="Хвилини в застосунку за днями" columns={['День', 'Хвилини']} rows={o.series.map((p) => [formatDay(p.day), p.minutes])}>
            <TimeLines data={o.series} series={[MINUTES]} height={200} />
          </ChartFigure>
        </div>
      )}

      {devices.data && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card title="Пристрої">
            <RankBars items={labelled(devices.data.deviceTypes, DEVICE_LABELS)} />
          </Card>
          <Card title="Як відкривають">
            <RankBars items={labelled(devices.data.appModes, MODE_LABELS)} />
          </Card>
          <Card title="Системи">
            <RankBars items={devices.data.os} />
          </Card>
          <Card title="Браузери">
            <RankBars items={devices.data.browsers} />
          </Card>
        </div>
      )}

      {geo.data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Країни">
            <RankBars items={geo.data.countries.map((c) => ({ ...c, name: countryName(c.name) }))} />
          </Card>
          <Card title="Міста">
            <RankBars items={geo.data.cities.map((c) => ({ name: `${c.name}, ${c.country}`, count: c.count }))} />
          </Card>
        </div>
      )}

      <p className="text-xs text-fg-subtle">
        Кожен користувач рахується один раз — за останнім входом у періоді. «Активні» — були в застосунку хоча б хвилину.{' '}
        <a href="https://db-ip.com" target="_blank" rel="noreferrer" className="underline hover:text-fg">
          IP Geolocation by DB-IP
        </a>
      </p>
    </div>
  )
}
