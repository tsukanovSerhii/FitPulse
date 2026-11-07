// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { installFakeAuthServer } from '@/shared/testing/fakeAuthServer'

const server = installFakeAuthServer()
const { store } = await import('@/app/store/store')
const { ResetPasswordPage } = await import('./ResetPasswordPage')

function Url() {
  const { pathname, search } = useLocation()
  return <output aria-label="url">{pathname + search}</output>
}

const renderAt = (url: string) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/reset-password" element={<><ResetPasswordPage /><Url /></>} />
          <Route path="/login" element={<p>Сторінка входу</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )

describe('ResetPasswordPage', () => {
  it('reset page requires matching passwords', async () => {
    renderAt('/reset-password?token=abc')
    await userEvent.type(screen.getByLabelText('Новий пароль'), 'brandnew123')
    await userEvent.type(screen.getByLabelText('Повторіть пароль'), 'brandnew124')
    await userEvent.click(screen.getByRole('button', { name: 'Зберегти пароль' }))
    expect(await screen.findByText('Паролі не збігаються')).toBeInTheDocument()
    expect(server.fetchMock.mock.calls.some(([url]) => url === '/api/auth/password/reset')).toBe(false)
  })

  it('sends the token and the new password, then shows the sign-in link', async () => {
    renderAt('/reset-password?token=abc')
    // The one-time token leaves the address bar and the history at once
    expect(await screen.findByLabelText('url')).toHaveTextContent('/reset-password', { normalizeWhitespace: true })
    expect(screen.getByLabelText('url').textContent).toBe('/reset-password')
    await userEvent.type(screen.getByLabelText('Новий пароль'), 'brandnew123')
    await userEvent.type(screen.getByLabelText('Повторіть пароль'), 'brandnew123')
    await userEvent.click(screen.getByRole('button', { name: 'Зберегти пароль' }))
    expect(await screen.findByText('Пароль змінено. Увійдіть з новим паролем.')).toBeInTheDocument()
    const call = server.fetchMock.mock.calls.find(([url]) => url === '/api/auth/password/reset')!
    expect(JSON.parse(String(call[1]!.body))).toEqual({ token: 'abc', password: 'brandnew123' })
  })

  it('reset page without token shows the invalid link message', () => {
    renderAt('/reset-password')
    expect(screen.getByText('Посилання недійсне або застаріло')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Надіслати нове посилання' })).toHaveAttribute('href', '/forgot-password')
  })
})
