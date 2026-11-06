// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { installFakeAuthServer } from '@/shared/testing/fakeAuthServer'

installFakeAuthServer()
const { store } = await import('@/app/store/store')
const { registerUser } = await import('@/features/auth/model')
const { fetchProfile } = await import('@/features/profile/model')
const { addBodyEntry } = await import('@/features/body/model')
const { RequireOnboarding } = await import('@/app/router/guards')
const { OnboardingPage } = await import('./OnboardingPage')

const renderAt = (path: string) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/"
            element={
              <RequireOnboarding>
                <p>Дашборд</p>
              </RequireOnboarding>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )

async function fillAboutYou(user: ReturnType<typeof userEvent.setup>, weight = '64') {
  await user.click(await screen.findByRole('radio', { name: 'Жіноча' }))
  await user.type(screen.getByLabelText('Вік'), '29')
  await user.type(screen.getByLabelText('Зріст, см'), '168')
  if (weight) await user.type(screen.getByLabelText('Вага, кг'), weight)
  await user.type(screen.getByLabelText('Бажана вага, кг'), '60')
}

beforeAll(async () => {
  await store.dispatch(registerUser({ name: 'Ira', email: 'ira@onboarding.ua', password: 'secret123' }))
  await store.dispatch(fetchProfile())
})

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('onboarding', () => {
  it('a user who has not finished onboarding is sent there from /', async () => {
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Розкажіть про себе' })).toBeInTheDocument()
  })

  it('next is blocked without a weight', async () => {
    const user = userEvent.setup()
    renderAt('/onboarding')
    await fillAboutYou(user, '')
    await user.click(screen.getByRole('button', { name: 'Далі' }))
    expect(await screen.findByText('Вкажіть вагу від 30 до 250 кг')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Розкажіть про себе' })).toBeInTheDocument()
  })

  it('answers survive a reload', async () => {
    const user = userEvent.setup()
    const first = renderAt('/onboarding')
    await fillAboutYou(user)
    await user.click(screen.getByRole('button', { name: 'Далі' }))
    expect(await screen.findByRole('heading', { name: 'Яка ваша мета?' })).toBeInTheDocument()
    first.unmount()

    renderAt('/onboarding')
    expect(await screen.findByRole('heading', { name: 'Яка ваша мета?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Назад' }))
    expect(screen.getByLabelText('Вага, кг')).toHaveValue(64)
  })

  it('finishing saves profile, weight, goal, equipment, limits and the chosen plan', async () => {
    // In the evening, later than the noon the body form uses for today
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 10, 7, 21, 0) })
    const user = userEvent.setup()
    renderAt('/onboarding')
    await fillAboutYou(user)
    await user.click(screen.getByRole('button', { name: 'Далі' }))

    await user.click(await screen.findByRole('radio', { name: /Набір м'язової маси/ }))
    await user.click(screen.getByRole('button', { name: 'Далі' }))

    await user.click(await screen.findByRole('radio', { name: 'Більше року' }))
    await user.click(screen.getByRole('radio', { name: '4' }))
    await user.click(screen.getByRole('button', { name: 'Далі' }))

    await user.click(await screen.findByRole('radio', { name: 'Вдома' }))
    await user.click(screen.getByRole('checkbox', { name: 'Коліна' }))
    await user.click(screen.getByRole('button', { name: 'Далі' }))

    expect(await screen.findByRole('heading', { name: 'Ваша перша програма' })).toBeInTheDocument()
    const choose = screen.getAllByRole('button', { name: /^Обрати/ })
    expect(choose.length).toBeGreaterThan(0)
    await user.click(choose[0]!)

    expect(await screen.findByText('Дашборд')).toBeInTheDocument()
    const state = store.getState()
    expect(state.profile.profile).toMatchObject({ gender: 'female', age: 29, heightCm: 168, weightKg: 64, targetWeightKg: 60, fitnessGoal: 'muscle_gain' })
    expect(state.profile.profile.onboardedAt).toBeTruthy()
    await waitFor(() => expect(store.getState().body.entries.some((e) => e.weightKg === 64)).toBe(true))
    expect(state.progress.weeklyGoal).toBe(4)
    expect(state.exercises.filters.equipment).toEqual(['dumbbell', 'bodyweight', 'bands'])
    expect(state.exercises.filters.limits).toEqual(['knees'])
    expect(state.workoutPlan.plans).toHaveLength(1)
    expect(state.workoutPlan.activePlanId).toBe(state.workoutPlan.plans[0]!.id)

    // A measurement for today, as the body form saves it at noon, is newer than the questionnaire's
    const today = new Date()
    const noon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12).toISOString()
    await store.dispatch(addBodyEntry({ date: noon, weightKg: 63 }))
    await waitFor(() => expect(store.getState().profile.profile.weightKg).toBe(63))
  })
})
