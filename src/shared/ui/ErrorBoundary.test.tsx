// @vitest-environment jsdom
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Crash({ crash }: { crash: boolean }) {
  if (crash) throw new Error('boom')
  return <p>Сторінка працює</p>
}

function Harness() {
  const [route, setRoute] = useState('/a')
  const [crash, setCrash] = useState(true)
  return (
    <>
      <button onClick={() => setRoute('/b')}>Інша сторінка</button>
      <button onClick={() => setCrash(false)}>Виправити</button>
      <ErrorBoundary
        resetKey={route}
        fallback={({ error, reset }) => (
          <div role="alert">
            {error.message}
            <button onClick={reset}>Ще раз</button>
          </div>
        )}
      >
        <Crash crash={crash && route === '/a'} />
      </ErrorBoundary>
    </>
  )
}

describe('ErrorBoundary', () => {
  it('shows the fallback instead of a crashed subtree', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Harness />)
    expect(screen.getByRole('alert')).toHaveTextContent('boom')
  })

  it('recovers through reset once the cause is fixed', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('Виправити'))
    await user.click(screen.getByText('Ще раз'))
    expect(screen.getByText('Сторінка працює')).toBeInTheDocument()
  })

  it('clears the error when the reset key changes', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByText('Інша сторінка'))
    expect(screen.getByText('Сторінка працює')).toBeInTheDocument()
  })
})
