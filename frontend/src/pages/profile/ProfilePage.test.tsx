// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { installFakeAuthServer } from '@/shared/testing/fakeAuthServer'

const server = installFakeAuthServer()
const { store } = await import('@/app/store/store')
const { registerUser } = await import('@/features/auth/model')
const { ProfilePage } = await import('./ProfilePage')

describe('ProfilePage', () => {
  it('saving the profile sends only a changed name to the server', async () => {
    await store.dispatch(registerUser({ name: 'Anna', email: 'anna@test.ua', password: 'secret123' }))
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </Provider>,
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Редагувати профіль' }))
    const name = await screen.findByLabelText("Ім'я")
    await userEvent.clear(name)
    await userEvent.type(name, 'Anna Nova')
    await userEvent.click(screen.getByRole('button', { name: 'Зберегти' }))

    await waitFor(() => expect(server.fetchMock.mock.calls.some(([url]) => url === '/api/me')).toBe(true))
    const patch = server.fetchMock.mock.calls.find(([url]) => url === '/api/me')!
    expect(JSON.parse(String(patch[1]!.body))).toEqual({ name: 'Anna Nova' })
    await waitFor(() => expect(store.getState().auth.user?.name).toBe('Anna Nova'))
  })
})
