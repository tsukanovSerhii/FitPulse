import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App.tsx'

const json = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const admin = { id: '7b0c0d63-7f2e-4f39-9a2b-0d7c2a1e5f10', email: 'a@x.com', role: 'admin', createdAt: '2026-11-07T10:00:00.000Z' }

/** A fake admin API: no session at first, a@x.com / staff-pass signs in. */
function fakeApi({ healthy = true } = {}) {
  let signedIn = false
  const fetchFn = (async (url: string, init: RequestInit = {}) => {
    const body = init.body ? JSON.parse(String(init.body)) : {}
    if (url === '/api/health') return healthy ? json(200, { status: 'ok' }) : Promise.reject(new TypeError('Failed to fetch'))
    if (url === '/api/auth/refresh') return signedIn ? json(200, { accessToken: 't', user: admin }) : json(401, { error: { code: 'SESSION_EXPIRED', message: 'x' } })
    if (url === '/api/auth/login') {
      if (body.email !== 'a@x.com' || body.password !== 'staff-pass') return json(401, { error: { code: 'INVALID_CREDENTIALS', message: 'Невірний email або пароль' } })
      signedIn = true
      return json(200, { accessToken: 't', user: admin })
    }
    if (url === '/api/auth/logout') {
      signedIn = false
      return new Response(null, { status: 204 })
    }
    return json(404, { error: { code: 'NOT_FOUND', message: url } })
  }) as unknown as typeof fetch
  return fetchFn
}

async function signIn(email = 'a@x.com', password = 'staff-pass') {
  await userEvent.type(await screen.findByLabelText('Email'), email)
  await userEvent.type(screen.getByLabelText('Пароль'), password)
  await userEvent.click(screen.getByRole('button', { name: 'Увійти' }))
}

describe('App', () => {
  it('shows the login form without a session', async () => {
    render(<App fetchFn={fakeApi()} />)
    expect(screen.getByRole('heading', { name: 'FitPulse Admin' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Увійти' })).toBeInTheDocument()
    expect(await screen.findByText('API: працює')).toBeInTheDocument()
  })

  it('signs in and shows email and role', async () => {
    render(<App fetchFn={fakeApi()} />)
    await signIn()
    expect(await screen.findByText('Ви увійшли як a@x.com (адміністратор)')).toBeInTheDocument()
  })

  it('shows the error for wrong credentials', async () => {
    render(<App fetchFn={fakeApi()} />)
    await signIn('a@x.com', 'wrong-pass')
    expect(await screen.findByRole('alert')).toHaveTextContent('Невірний email або пароль')
  })

  it('logout returns to the login form', async () => {
    render(<App fetchFn={fakeApi()} />)
    await signIn()
    await userEvent.click(await screen.findByRole('button', { name: 'Вийти' }))
    expect(await screen.findByRole('button', { name: 'Увійти' })).toBeInTheDocument()
  })

  it('shows API down on network error', async () => {
    render(<App fetchFn={fakeApi({ healthy: false })} />)
    expect(await screen.findByText('API: недоступне')).toBeInTheDocument()
  })
})
