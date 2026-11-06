// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { installFakeAuthServer } from '@/shared/testing/fakeAuthServer'

const server = installFakeAuthServer()
const { store } = await import('@/app/store/store')
const { ForgotPasswordPage } = await import('./ForgotPasswordPage')

describe('ForgotPasswordPage', () => {
  it('forgot page shows the confirmation after sending', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </Provider>,
    )
    await userEvent.type(screen.getByLabelText('Email'), 'ira@mail.com')
    await userEvent.click(screen.getByRole('button', { name: 'Надіслати посилання' }))
    expect(await screen.findByText(/Якщо акаунт з таким email існує, ми надіслали лист/)).toBeInTheDocument()
    const call = server.fetchMock.mock.calls.find(([url]) => url === '/api/auth/password/forgot')!
    expect(JSON.parse(String(call[1]!.body))).toEqual({ email: 'ira@mail.com' })
  })

  it('asks for a valid email first', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </Provider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Надіслати посилання' }))
    expect(await screen.findByText('Вкажіть коректний email')).toBeInTheDocument()
  })
})
