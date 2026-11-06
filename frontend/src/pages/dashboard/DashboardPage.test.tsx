// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { installFakeAuthServer } from '@/shared/testing/fakeAuthServer'

installFakeAuthServer()
const { store } = await import('@/app/store/store')
const { registerUser } = await import('@/features/auth/model')
const { fetchPlans } = await import('@/features/workoutPlan/model')
const { fetchProgress } = await import('@/features/progress/model')
const { DashboardPage } = await import('./DashboardPage')

describe('DashboardPage', () => {
  beforeAll(async () => {
    await store.dispatch(registerUser({ name: 'Ira', email: 'ira@dashboard.ua', password: 'secret123' }))
    await store.dispatch(fetchPlans())
    await store.dispatch(fetchProgress())
  })

  it('with no workouts the dashboard invites the first one', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </Provider>,
    )
    expect(await screen.findByRole('heading', { name: 'Перше тренування' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Обрати програму' }).length).toBeGreaterThan(0)
    expect(screen.getByText('Тренувань')).toBeInTheDocument()
  })
})
