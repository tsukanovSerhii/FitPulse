import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { AdminUser } from '../api/client.ts'
import { createAdminClient } from '../api/client.ts'
import { SessionContext } from '../session.tsx'
import { UserPage } from './UserPage.tsx'
import { UsersPage } from './UsersPage.tsx'

const json = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const bob = { id: '11111111-1111-4111-8111-111111111111', name: 'Bob', email: 'bob@mail.com', plan: 'free', createdAt: '2026-11-01T10:00:00.000Z', blockedAt: null }
const staff = (role: 'admin' | 'manager'): AdminUser => ({ id: '7b0c0d63-7f2e-4f39-9a2b-0d7c2a1e5f10', email: 'boss@x.com', role, createdAt: '2026-11-01T00:00:00.000Z' })

function fakeApi() {
  const calls: string[] = []
  let blocked: string | null = null
  const fetchFn = async (url: string, init: RequestInit = {}) => {
    const method = init.method ?? 'GET'
    calls.push(`${method} ${url}`)
    if (url.startsWith('/api/users?')) {
      const query = new URL(url, 'http://x').searchParams.get('query') ?? ''
      const items = 'bob@mail.com'.includes(query.toLowerCase()) ? [bob] : []
      return json(200, { items, total: items.length, page: 1, pageSize: 20 })
    }
    if (url === `/api/users/${bob.id}` && method === 'GET') return json(200, { ...bob, blockedAt: blocked, workouts: 7, bodyEntries: 2, lastSyncAt: null, activeSessions: 1 })
    if (url === `/api/users/${bob.id}/block`) {
      blocked = '2026-11-08T10:00:00.000Z'
      return json(200, { ...bob, blockedAt: blocked })
    }
    return json(404, { error: { code: 'NOT_FOUND', message: url } })
  }
  return { client: createAdminClient(fetchFn as unknown as typeof fetch), calls }
}

function renderAt(path: string, role: 'admin' | 'manager', api = fakeApi()) {
  render(
    <SessionContext.Provider value={{ client: api.client, user: staff(role) }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserPage />} />
        </Routes>
      </MemoryRouter>
    </SessionContext.Provider>,
  )
  return api
}

describe('users', () => {
  it('search finds a user and opens the card', async () => {
    const user = userEvent.setup()
    renderAt('/users', 'manager')
    await user.type(screen.getByLabelText('Пошук за email або ім’ям'), 'bob')
    await user.click(await screen.findByRole('link', { name: /bob@mail\.com/ }))
    expect(await screen.findByRole('heading', { name: 'Bob' })).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('a manager sees block but not the admin actions', async () => {
    renderAt(`/users/${bob.id}`, 'manager')
    expect(await screen.findByRole('button', { name: 'Заблокувати' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Видалити акаунт' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Тариф')).not.toBeInTheDocument()
  })

  it('an admin also sees the plan and delete', async () => {
    renderAt(`/users/${bob.id}`, 'admin')
    expect(await screen.findByRole('button', { name: 'Видалити акаунт' })).toBeInTheDocument()
    expect(screen.getByLabelText('Тариф')).toBeInTheDocument()
  })

  it('blocking asks for confirmation first', async () => {
    const user = userEvent.setup()
    const api = renderAt(`/users/${bob.id}`, 'manager')
    await user.click(await screen.findByRole('button', { name: 'Заблокувати' }))
    expect(api.calls).not.toContain(`POST /api/users/${bob.id}/block`)
    await user.click(screen.getByRole('button', { name: 'Так, заблокувати' }))
    await waitFor(() => expect(api.calls).toContain(`POST /api/users/${bob.id}/block`))
    expect(await screen.findByText('Заблоковано')).toBeInTheDocument()
  })
})
