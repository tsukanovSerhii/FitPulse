import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createAdminClient, type AdminUser } from '../api/client.ts'
import { SessionContext } from '../session.tsx'
import { StatsPage } from './StatsPage.tsx'

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })
const staff: AdminUser = { id: '7b0c0d63-7f2e-4f39-9a2b-0d7c2a1e5f10', email: 'help@x.com', role: 'manager', createdAt: '2026-11-01T00:00:00.000Z' }

function api() {
  const calls: string[] = []
  const fetchFn = async (url: string) => {
    calls.push(url)
    const days = Number(new URL(url, 'http://x').searchParams.get('days') ?? 30)
    if (url.startsWith('/api/analytics/overview'))
      return json({
        days,
        series: Array.from({ length: days }, (_, i) => ({ day: new Date(Date.UTC(2026, 7, 1 + i)).toISOString().slice(0, 10), signups: i, active: 2, workouts: 1, minutes: 30 })),
        current: { signups: 12, activeUsers: 8, workouts: 20, minutesPerActive: 14.5 },
        previous: { signups: 6, activeUsers: 8, workouts: 25, minutesPerActive: 10 },
        retention: 0.4,
      })
    if (url.startsWith('/api/analytics/devices'))
      return json({ deviceTypes: [{ name: 'mobile', count: 6 }, { name: 'desktop', count: 2 }], os: [{ name: 'iOS', count: 4 }], browsers: [], appModes: [{ name: 'installed', count: 3 }] })
    if (url.startsWith('/api/analytics/geo')) return json({ countries: [{ name: 'UA', count: 7 }], cities: [{ name: 'Kyiv', country: 'UA', count: 5 }] })
    if (url === '/api/stats') return json({ users: 40, newUsers7d: 3, newUsers30d: 12, activeUsers7d: 8, workouts: 300, workouts7d: 20, proUsers: 4, blockedUsers: 1 })
    return new Response('{}', { status: 404 })
  }
  return { client: createAdminClient(fetchFn as unknown as typeof fetch), calls }
}

function renderPage() {
  const a = api()
  render(
    <SessionContext.Provider value={{ client: a.client, user: staff }}>
      <MemoryRouter>
        <StatsPage />
      </MemoryRouter>
    </SessionContext.Provider>,
  )
  return a
}

describe('overview', () => {
  it('shows headline numbers with the change against the previous period', async () => {
    renderPage()
    const tile = (await screen.findByText('Реєстрації')).closest('div')!
    expect(within(tile).getByText('12')).toBeInTheDocument()
    expect(within(tile).getByText(/100% до попереднього періоду/)).toBeInTheDocument()
    expect(await screen.findByText('40%')).toBeInTheDocument()
    expect(screen.getByText('Україна')).toBeInTheDocument()
    expect(screen.getByText('Телефон')).toBeInTheDocument()
    expect(screen.getByText(/IP Geolocation by DB-IP/)).toBeInTheDocument()
  })

  it('switching the period asks for that period', async () => {
    const user = userEvent.setup()
    const a = renderPage()
    await screen.findByText('Реєстрації')
    await user.click(screen.getByRole('radio', { name: '90 днів' }))
    await waitFor(() => expect(a.calls).toContain('/api/analytics/overview?days=90'))
    expect(a.calls).toContain('/api/analytics/devices?days=90')
  })

  it('every chart has its numbers as a table', async () => {
    renderPage()
    await screen.findByText('Реєстрації')
    expect(screen.getAllByText('Таблиця даних').length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByRole('table', { hidden: true }).length).toBeGreaterThanOrEqual(3)
  })
})
