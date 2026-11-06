import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App.tsx'

const respond = (body: unknown, status = 200) => () =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }))

describe('App', () => {
  it('shows API up', async () => {
    render(<App fetchFn={respond({ status: 'ok' })} />)
    expect(screen.getByRole('heading', { name: 'FitPulse Admin' })).toBeInTheDocument()
    expect(await screen.findByText('API: працює')).toBeInTheDocument()
  })

  it('shows API down on network error', async () => {
    render(<App fetchFn={() => Promise.reject(new TypeError('Failed to fetch'))} />)
    expect(await screen.findByText('API: недоступне')).toBeInTheDocument()
  })

  it('shows API down when the response is not the health body', async () => {
    render(<App fetchFn={respond({ error: { code: 'INTERNAL_ERROR', message: 'x' } }, 502)} />)
    expect(await screen.findByText('API: недоступне')).toBeInTheDocument()
  })
})
