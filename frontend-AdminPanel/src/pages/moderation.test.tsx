import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createAdminClient, type AdminUser } from '../api/client.ts'
import { SessionContext } from '../session.tsx'
import { ModerationPage } from './ModerationPage.tsx'

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const staff: AdminUser = { id: '7b0c0d63-7f2e-4f39-9a2b-0d7c2a1e5f10', email: 'help@x.com', role: 'manager', createdAt: '2026-11-01T00:00:00.000Z' }
const item = {
  id: '33333333-3333-4333-8333-333333333333',
  status: 'pending',
  rejectReason: null,
  exercise: {
    name: 'Жим Арнольда',
    primaryMuscle: 'shoulders',
    muscleGroups: ['shoulders'],
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    description: 'Розворот під час жиму',
    defaultSets: 3,
    defaultReps: 10,
    defaultRestSeconds: 90,
    technique: { steps: [{ title: 'Крок 1', text: 'Гантелі перед собою', frame: 0, seconds: 0 }], cues: ['Лікті вперед'], mistakes: ['Прогин у попереку'] },
  },
  author: { id: '44444444-4444-4444-8444-444444444444', name: 'Ira', email: 'ira@mail.com' },
  createdAt: '2026-11-08T10:00:00.000Z',
  reviewedAt: null,
}

function setup() {
  const calls: { method: string; url: string; body?: unknown }[] = []
  let queue = [item]
  const fetchFn = async (url: string, init: RequestInit = {}) => {
    const method = init.method ?? 'GET'
    calls.push({ method, url, body: init.body ? JSON.parse(String(init.body)) : undefined })
    if (url.startsWith('/api/moderation/exercises?')) return json(200, { items: queue, total: queue.length, page: 1, pageSize: 20 })
    if (url.endsWith('/approve') || url.endsWith('/reject')) {
      queue = []
      return json(200, { ...item, status: url.endsWith('/approve') ? 'approved' : 'rejected' })
    }
    return json(404, { error: { code: 'NOT_FOUND', message: url } })
  }
  render(
    <SessionContext.Provider value={{ client: createAdminClient(fetchFn as unknown as typeof fetch), user: staff }}>
      <MemoryRouter>
        <ModerationPage />
      </MemoryRouter>
    </SessionContext.Provider>,
  )
  return calls
}

describe('moderation', () => {
  it('shows the exercise as the app would, with its author', async () => {
    setup()
    expect(await screen.findByRole('heading', { name: 'Жим Арнольда' })).toBeInTheDocument()
    expect(screen.getByText(/Ira · ira@mail\.com/)).toBeInTheDocument()
    expect(screen.getByText('Гантелі перед собою')).toBeInTheDocument()
    expect(screen.getByText('Прогин у попереку')).toBeInTheDocument()
    expect(screen.getByText(/Плечі · Середній · Гантелі · 3 × 10 · 90 с/)).toBeInTheDocument()
  })

  it('approve publishes it and the queue reloads', async () => {
    const user = userEvent.setup()
    const calls = setup()
    await user.click(await screen.findByRole('button', { name: 'Схвалити' }))
    await waitFor(() => expect(calls.some((c) => c.method === 'POST' && c.url === `/api/moderation/exercises/${item.id}/approve`)).toBe(true))
    expect(await screen.findByText('Заявок немає')).toBeInTheDocument()
  })

  it('reject needs a reason, which is sent to the author', async () => {
    const user = userEvent.setup()
    const calls = setup()
    await user.click(await screen.findByRole('button', { name: 'Відхилити' }))
    const send = screen.getByRole('button', { name: 'Надіслати відмову' })
    expect(send).toBeDisabled()
    await user.type(screen.getByLabelText('Причина для автора'), 'Дублює вбудовану вправу')
    await user.click(send)
    await waitFor(() => expect(calls.find((c) => c.url.endsWith('/reject'))?.body).toEqual({ reason: 'Дублює вбудовану вправу' }))
  })

  it('switches between pending, published and rejected', async () => {
    const user = userEvent.setup()
    const calls = setup()
    await user.click(await screen.findByRole('tab', { name: 'Опубліковані' }))
    await waitFor(() => expect(calls.some((c) => c.url.includes('status=approved'))).toBe(true))
  })
})
